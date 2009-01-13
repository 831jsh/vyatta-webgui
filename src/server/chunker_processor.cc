#include <unistd.h>
#include <sys/time.h>
#include <sys/sysinfo.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <signal.h>
#include <syslog.h>
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "chunker_processor.hh"

using namespace std;


#define EXIT_SUCCESS 0
#define EXIT_FAILURE 1


  
/**
 *
 **/
void
ChunkerProcessor::start_new(string token, const string &cmd)
{
  if (_debug) {
    cout << "ChunkerProcessor::start_new(): starting new processor" << endl;
  }



  struct sigaction sa;
  sigaction(SIGCHLD, NULL, &sa);
  sa.sa_flags |= SA_NOCLDWAIT;//(since POSIX.1-2001 and Linux 2.6 and later)
  sigaction(SIGCHLD, &sa, NULL);


  if (fork() != 0) {
    //parent
    return;
  }

  //should detach child process at this point


  umask(0);
  setsid();

  int cp[2]; /* Child to parent pipe */

  if( pipe(cp) < 0) {
    perror("Can't make pipe");
    exit(1);
  }
  
  pid_t pid = fork();
  if (pid == 0) {
    //child
    writer(token,cmd,cp);
    exit(0);
  }
  else {
    //parent
    reader(token,cp);

    //now wait on child to kick the bucket
    wait();
    exit(0);
  }
}

/**
 *
 **/
void
ChunkerProcessor::writer(string token, const string &cmd,int (&cp)[2])
{
  //use child pid to allow cleanup of parent
  if (_pid_path.empty() == false) {
    _pid_path += "/" + token;
    pid_output(_pid_path.c_str());
  }
  /* Child. */
  close(1); /* Close current stdout. */
  dup( cp[1]); /* Make stdout go to write end of pipe. */
  close(0); /* Close current stdin. */
  close( cp[0]);

  string opmodecmd;
  opmodecmd = WebGUI::mass_replace(cmd,"'","'\\''");
  opmodecmd = "/bin/bash -c '" + opmodecmd + "'";
  //    string opmodecmd = "/bin/bash -i -c " + command;
  //  string opmodecmd = cmd;
  
  cout << "op dmc: " << opmodecmd << endl;

  char *argv_tmp[64], *argv[64];
  char *tmp = (char*)cmd.c_str();
  //  parse(tmp, argv_tmp);
  /*
  argv[0] = "/bin/bash\0";
  //  argv[1] = "-i\0";
  argv[1] = "-c\0";
  string str = string("'") + cmd.c_str() + "'\0";
  argv[2] = (char*)str.c_str();

  printf("argv[0]: %s, %s\n",argv[0],argv_tmp[0]);
  printf("argv[1]: %s, %s\n",argv[1],argv_tmp[1]);
  printf("argv[2]: %s, %s\n",argv[2],argv_tmp[2]);
  //  printf("argv[3]: %s, %s\n",argv[3],argv_tmp[3]);
  */

  
  opmodecmd = WebGUI::mass_replace(cmd,"'","");
  char tmpcmd[1024];

  sprintf(tmpcmd,"%s",opmodecmd.c_str());
  //  printf("%s<end>\n",tmpcmd);
  /*

  sprintf(tmpcmd,"ping  10.3.0.1");
  printf("%s<end>\n",tmpcmd);
  */
  parse(tmpcmd,argv);
  /*
  printf("argv[0]: %s\n",argv[0]);
  printf("argv[1]: %s\n",argv[1]);
  */
  execvp(argv[0], argv);
}

/**
 *
 **/
void
ChunkerProcessor::reader(string token,int (&cp)[2])
{
  /* Parent. */
  /* Close what we don't need. */
  char buf[_chunk_size+1];
  long chunk_ct = 0;
  long last_time = 0;
  string tmp;
  
  struct timeval t;
  gettimeofday(&t,NULL);
  unsigned long cur_time;
  usleep(1000*1000);
  close(cp[1]);
  while ((read(cp[0], &buf, 1) == 1)) {
    tmp += string(buf);
    tmp = process_chunk(tmp, token, chunk_ct, last_time);
    
    //now update our time
    gettimeofday(&t,NULL);
    cur_time = t.tv_sec;
  }
}

/**
 *
 **/
string 
ChunkerProcessor::process_chunk(string &str, string &token, long &chunk_ct, long &last_time)
{
  struct sysinfo info;
  long cur_time = 0;
  if (sysinfo(&info) == 0) {
    cur_time = info.uptime;
  }

  if ((long)str.size() > _chunk_size || last_time + WebGUI::CHUNKER_MAX_WAIT_TIME < cur_time) {
    //OK, let's find a natural break and start processing
    size_t pos = str.rfind('\n');
    string chunk;
    if (pos != string::npos) {
      chunk = str.substr(0,pos);
      str = str.substr(pos+1,str.length());
    }
    else {
      chunk = str;
      str = string("");
    }

    char buf[80];
    sprintf(buf,"%lu",chunk_ct);
    string file = WebGUI::CHUNKER_RESP_TOK_DIR + WebGUI::CHUNKER_RESP_TOK_BASE + token + "_" + string(buf);
    FILE *fp = fopen(file.c_str(), "w");
    if (fp) {
      fwrite(chunk.c_str(),1,chunk.length(),fp);
      ++chunk_ct;
      last_time = cur_time;
      fclose(fp);
    }
    else {
      syslog(LOG_ERR,"webgui: Failed to write out response chunk");
    }
  }
  return str;
}

/**
 *
 **/
void  
ChunkerProcessor::parse(char *line, char **argv)
{
  while (*line != '\0') {       /* if not the end of line ....... */ 
    while (*line == ' ' || *line == '\t' || *line == '\n')
      *line++ = '\0';     /* replace white spaces with 0    */
    *argv++ = line;          /* save the argument position     */
    while (*line != '\0' && *line != ' ' && 
	   *line != '\t' && *line != '\n') 
      line++;             /* skip the argument until ...    */
  }
  *argv = '\0';                 /* mark the end of argument list  */
}


/**
 *
 *below borrowed from quagga library.
 **/
#define PIDFILE_MASK 0644
pid_t
ChunkerProcessor::pid_output (const char *path)
{
  FILE *fp;
  pid_t pid;
  mode_t oldumask;

  pid = getpid();

  oldumask = umask(0777 & ~PIDFILE_MASK);
  fp = fopen (path, "w");
  if (fp != NULL) 
    {
      fprintf (fp, "%d\n", (int) pid);
      fclose (fp);
      umask(oldumask);
      return pid;
    }
  /* XXX Why do we continue instead of exiting?  This seems incompatible
     with the behavior of the fcntl version below. */
  syslog(LOG_ERR,"Can't fopen pid lock file %s, continuing",
            path);
  umask(oldumask);
  return -1;
}
