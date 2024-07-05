package fr.gouv.cnsp.monitorfish.domain.entities.facade

enum class SeafrontGroup {
    ALL,
    MED,
    MEMN,
    NAMO,
    OUTREMEROA,
    OUTREMEROI,
    SA,
    NONE,
    ;

    companion object {
        private val groupToSeafronts = mapOf(
            ALL to Seafront.entries,
            MED to listOf(Seafront.CORSE, Seafront.MED),
            MEMN to listOf(Seafront.MEMN),
            NAMO to listOf(Seafront.NAMO),
            OUTREMEROA to listOf(Seafront.GUADELOUPE, Seafront.GUYANE, Seafront.MARTINIQUE),
            OUTREMEROI to listOf(Seafront.MAYOTTE, Seafront.SUD_OCEAN_INDIEN),
            SA to listOf(Seafront.SA),
            NONE to emptyList(),
        )

        fun fromSeafront(seafront: Seafront?): SeafrontGroup {
            return seafront?.let { groupToSeafronts.entries.first { it.key != ALL && it.value.contains(seafront) }.key }
                ?: NONE
        }
    }

    fun hasSeafront(seafront: Seafront?): Boolean {
        if (this == ALL) {
            return true
        }
        if (this == NONE) {
            return seafront == null
        }

        return groupToSeafronts[this]?.contains(seafront) ?: false
    }

    fun toSeafronts(): List<Seafront> {
        return groupToSeafronts[this] ?: emptyList()
    }
}
