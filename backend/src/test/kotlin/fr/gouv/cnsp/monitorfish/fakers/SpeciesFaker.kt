package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species

class SpeciesFaker {
    companion object {
        fun fakeSpecies(
            code: String = "HKE",
            name: String = "European Hake",
            scipSpeciesType: ScipSpeciesType? = null,
        ): Species =
            Species(
                code = code,
                name = name,
                scipSpeciesType = scipSpeciesType,
            )
    }
}
