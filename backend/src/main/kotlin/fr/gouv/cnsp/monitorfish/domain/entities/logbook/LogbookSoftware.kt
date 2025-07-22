package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookSoftware(
    val software: String,
) {
    /**
     * Examples:
     * - "Journal de pêche Télétransmis":   JT/01641449/VISIOCaptures 2.1.6
     * - "Fiche de pêche Télétransmise":    FT/01641449/VISIOCaptures 2.1.6
     * - "Journal de pêche papier":         JP/01641449/VISIOCaptures 2.1.6
     * - "Fiche de pêche papier":           FP/01641449/VISIOCaptures 2.1.6
     */
    VISIOCAPTURES("VISIOCaptures"),

    /**
     * Examples:
     * - e-Sacapt Secours ERSV3 V 1.3.1
     */
    E_SACAPT("e-Sacapt"),
    ;

    companion object {
        /**
         * True for:
         * - VisioCaptures in real time (FT and JT)
         * - VisioCaptures in sheets (JP and FP)
         */
        fun isVisioCapture(software: String?): Boolean {
            val isVisioCapture = software?.contains(VISIOCAPTURES.software)

            return isVisioCapture ?: false
        }

        fun isESacapt(software: String?): Boolean {
            val isESacapt = software?.contains(E_SACAPT.software)

            return isESacapt ?: false
        }
    }
}
