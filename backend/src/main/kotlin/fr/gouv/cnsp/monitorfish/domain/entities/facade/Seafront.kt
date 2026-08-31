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
    OI_HORS_ZEE("Océan Indien Hors ZEE"),
    LA_REUNION("La Réunion"),
    POLYNESIE_FRANCAISE("Polynésie Française"),

    // Split into POLYNESIE_FRANCAISE and CLIPPERTON, but still stored by the CROSS referential and by rows
    // predating the split, so reading it must keep working
    POLYNESIE_ET_CLIPPERTON("Polynésie et Clipperton"),
    NOUVELLE_CALEDONIE("Nouvelle Calédonie"),
    CLIPPERTON("Clipperton"),
    WALLIS_FUTUNA("Wallis et Futuna"),
    SAINT_PIERRE_MIQUELON("Saint-Pierre et Miquelon"),
    SAINT_MARTIN("Saint-Martin"),
    SAINT_BARTHELEMY("Saint-Barthélemy"),
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
