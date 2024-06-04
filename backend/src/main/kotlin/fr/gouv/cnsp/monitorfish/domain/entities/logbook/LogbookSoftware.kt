package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookSoftware(val software: String) {
    /**
     * Examples:
     * - JP/05883989/VISIOCaptures V1.7.6
     * - FP/01641449/VISIOCaptures 2.1.6
     * - JP/07210344/VISIOCaptures 2.1.6
     */
    VISIOCAPTURE("VISIOCaptures"),

    /**
     * Examples:
     * - e-Sacapt Secours ERSV3 V 1.3.1
     */
    E_SACAPT("e-Sacapt"),
    ;

    companion object {
        /**
         * True for:
         * - VisioCaptures in real time (JP and JT)
         * - VisioCaptures in sheets (FP)
         */
        fun isVisioCapture(software: String?): Boolean {
            val isVisioCapture = software?.contains(VISIOCAPTURE.software)

            return isVisioCapture ?: false
        }

        fun isESacapt(software: String?): Boolean {
            val isESacapt = software?.contains(E_SACAPT.software)

            return isESacapt ?: false
        }

        fun isVisioCaptureInRealTime(software: String?): Boolean {
            val isVisioCapture = software?.let {
                it.startsWith("FT") || it.startsWith("JT")
            }

            return isVisioCapture ?: false
        }
    }
}
