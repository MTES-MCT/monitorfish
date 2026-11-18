package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.SpeciesDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.toContract

fun Species.toSpeciesDataOutput() =
    SpeciesDataOutput(
        code = code,
        name = name,
        scipSpeciesType = scipSpeciesType?.toContract(),
    )
