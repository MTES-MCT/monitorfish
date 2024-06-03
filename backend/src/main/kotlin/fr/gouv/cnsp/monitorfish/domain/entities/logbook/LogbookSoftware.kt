package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookSoftware(val software: String) {
    VISIOCAPTURE("VISIOCaptures"),
    E_SACAPT("e-Sacapt"),
    ;

    companion object {
        fun isVisioCapture(software: String?): Boolean {
            val isVisioCapture = software?.let {
                it.startsWith("FT") || it.startsWith("JT")
            }

            return isVisioCapture ?: false
        }
    }
}
