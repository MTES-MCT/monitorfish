package fr.gouv.cnsp.monitorfish.domain.entities.facade

/**
 * This Seafront enum is used as a type safeguard to prevent storing any string to a postgres `facade` column
 */
enum class Seafront(
    private val storedValue: String,
) {
    MARTINIQUE("Martinique"),
    SUD_OCEAN_INDIEN("Sud Océan Indien"),
    GUADELOUPE("Guadeloupe"),
    MED("MED"),
    SA("SA"),
    MEMN("MEMN"),
    GUYANE("Guyane"),
    MAYOTTE("Mayotte"),
    NAMO("NAMO"),
    CORSE("Corse"),
    HORS_FACADE("Hors façade"),
    HORS_ZEE_OI("Hors ZEE Océan Indien"),
    LA_REUNION("La Réunion"),
    SAINT_PIERRE_MIQUELON("St Pierre et Miquelon"),
    SAINT_MARTIN("St Martin"),
    SAINT_BARTHELEMY("St Barthélémy"),
    TAAF("TAAF"),
    ;

    companion object {
        infix fun from(storedValue: String): Seafront =
            try {
                entries.first { it.storedValue == storedValue }
            } catch (e: NoSuchElementException) {
                throw NoSuchElementException("Seafront $storedValue not found.", e)
            }
    }

    override fun toString(): String = storedValue
}
