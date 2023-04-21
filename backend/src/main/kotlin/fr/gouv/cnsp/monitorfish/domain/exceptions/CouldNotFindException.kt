package fr.gouv.cnsp.monitorfish.domain.exceptions

class CouldNotFindException(message: String, cause: Throwable? = null) :
    Throwable(message, cause)
