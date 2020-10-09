package fr.gouv.cnsp.monitorfish.domain.exceptions

class NAFMessageParsingException(message: String, NAFMessage: String, cause: Throwable? = null) :
        Throwable("$message for NAF message \"$NAFMessage\"", cause)