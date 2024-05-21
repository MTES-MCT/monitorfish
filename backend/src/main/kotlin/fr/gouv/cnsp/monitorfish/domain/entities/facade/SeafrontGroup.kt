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
            ALL to Facade.entries,
            MED to listOf(Facade.CORSE, Facade.MED),
            MEMN to listOf(Facade.MEMN),
            NAMO to listOf(Facade.NAMO),
            OUTREMEROA to listOf(Facade.GUADELOUPE, Facade.GUYANE, Facade.MARTINIQUE),
            OUTREMEROI to listOf(Facade.MAYOTTE, Facade.SUD_OCEAN_INDIEN),
            SA to listOf(Facade.SA),
            NONE to emptyList(),
        )

        fun toSeafronts(seaFrontGroup: SeafrontGroup): List<Facade> {
            return groupToSeafronts[seaFrontGroup] ?: emptyList()
        }
    }
}

fun SeafrontGroup.toSeafronts(): List<Facade> = SeafrontGroup.toSeafronts(this)
