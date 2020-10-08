package fr.gouv.cnsp.monitorfish.infrastructure.api.inputs.exceptions

class NAFMessageParsingException(message: String, NAFMessage: String, cause: Throwable? = null) :
        Exception("$message for NAF message \"$NAFMessage\"", cause)