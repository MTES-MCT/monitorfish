package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookSoftware(
    val software: String,
) {
    /**
     * Examples:
     * - e-Sacapt Secours ERSV3 V 1.3.1
     */
    E_SACAPT("e-Sacapt"),
    ;

    companion object {
        fun isESacapt(software: String?): Boolean {
            val isESacapt = software?.contains(E_SACAPT.software)

            return isESacapt ?: false
        }
    }
}
