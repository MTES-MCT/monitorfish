package fr.gouv.cnsp.monitorfish.domain.exceptions

/** Thrown when a database row data is not of the expected category or type. */
class WrongTypeException(message: String) : RuntimeException(message)
