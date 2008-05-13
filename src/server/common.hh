#ifndef __COMMON_HH__
#define __COMMON_HH__

class WebGUI
{
public:
  typedef enum Error {SUCCESS,
		      MALFORMED_REQUEST,
		      SERVER_FAILED,
		      RELOAD_CONFIGURATION,
		      COMMAND_ERROR,
		      FAILED_LOGIN,
		      COMMIT_IN_PROGRESS,
		      CONFIGURATION_CHANGE};

  typedef enum MsgType {NEWSESSION = 0,
			CLICMD,
			GETCONFIG,
			CLOSESESSION,
			NOTIFICATION};

  typedef enum ParseNode {NEWSESSION_USER = 0,
			  NEWSESSION_PSWD};

  typedef enum NodeType {NONE,
			 TEXT,
			 IPV4,
			 IPV4NET,
			 IPV6,
			 IPV6NET,
			 U32,
			 BOOL,
			 MACADDR};
};


#endif
