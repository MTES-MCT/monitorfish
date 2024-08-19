package fr.gouv.cnsp.monitorfish.domain.entities.position

enum class NetworkType(val code: String) {
    CELLULAR("CEL"),
    SATELLITE("SAT"),
    ;

    companion object {
        infix fun from(code: String): NetworkType {
            return try {
                NetworkType.entries.first { it.code == code }
            } catch (e: NoSuchElementException) {
                throw NoSuchElementException("NetworkType $code not found.", e)
            }
        }
    }
}
