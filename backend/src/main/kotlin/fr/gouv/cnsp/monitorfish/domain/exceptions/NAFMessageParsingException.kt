package fr.gouv.cnsp.monitorfish.domain.exceptions

class NAFMessageParsingException(message: String, nafMessage: String, cause: Throwable? = null) :
  Throwable("$message for NAF message \"$nafMessage\"", cause)
