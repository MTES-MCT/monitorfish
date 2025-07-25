package fr.gouv.cnsp.monitorfish.domain.entities.position

import org.slf4j.Logger
import org.slf4j.LoggerFactory

enum class NetworkType(
    val codes: List<String>,
) {
    CELLULAR(
        listOf(
            "CEL", // NEMO (CLS) and CLS
            "GSM", // Agiltech
        ),
    ),
    SATELLITE(
        listOf(
            "SAT", // Agiltech
            "VAR", // NEMO (CLS)
            "IRI", // CLS
        ),
    ),
    ;

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(NetworkType::class.java)

        infix fun from(code: String): NetworkType? =
            try {
                NetworkType.entries.first { it.codes.contains(code) }
            } catch (e: NoSuchElementException) {
                logger.error("NAF Message parsing : NetworkType $code not found.", e)

                null
            }
    }
}
