package fr.gouv.cnsp.monitorfish.domain.entities.facade

enum class SeafrontGroup {
    ALL,
    MED,
    MEMN,
    NAMO,
    OUTREMEROA,
    OUTREMEROI,
    SA,
    NO_FACADE,
    ;

    companion object {
        private val groupToSeafronts =
            mapOf(
                ALL to Seafront.entries,
                MED to listOf(Seafront.CORSE, Seafront.MED),
                MEMN to listOf(Seafront.MEMN),
                NAMO to listOf(Seafront.NAMO),
                OUTREMEROA to
                    listOf(
                        Seafront.SAINT_PIERRE_MIQUELON,
                        Seafront.SAINT_MARTIN,
                        Seafront.SAINT_BARTHELEMY,
                        Seafront.GUADELOUPE,
                        Seafront.GUYANE,
                        Seafront.MARTINIQUE,
                    ),
                OUTREMEROI to
                    listOf(
                        Seafront.OI_HORS_ZEE,
                        Seafront.LA_REUNION,
                        Seafront.MAYOTTE,
                        Seafront.SUD_OCEAN_INDIEN,
                        Seafront.TAAF,
                    ),
                SA to listOf(Seafront.SA),
                NO_FACADE to listOf(Seafront.POLYNESIE_CLIPPERTON),
            )

        fun fromSeafront(seafront: Seafront?): SeafrontGroup =
            seafront?.let { groupToSeafronts.entries.first { it.key != ALL && it.value.contains(seafront) }.key }
                ?: NO_FACADE
    }

    fun hasSeafront(seafront: Seafront?): Boolean {
        if (this == ALL) {
            return true
        }
        if (this == NO_FACADE) {
            return seafront == null
        }

        return groupToSeafronts[this]?.contains(seafront) ?: false
    }

    fun toSeafronts(): List<Seafront> = groupToSeafronts[this] ?: emptyList()
}
