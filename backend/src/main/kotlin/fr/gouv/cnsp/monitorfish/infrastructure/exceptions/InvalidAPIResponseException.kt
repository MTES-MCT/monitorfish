package fr.gouv.cnsp.monitorfish.infrastructure.exceptions

class InvalidAPIResponseException(message: String, cause: Throwable? = null) :
        Throwable(message, cause)