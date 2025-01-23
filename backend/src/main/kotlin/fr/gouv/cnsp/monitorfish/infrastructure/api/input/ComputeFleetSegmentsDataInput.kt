package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class ComputeFleetSegmentsDataInput(
    val faoAreas: List<String>,
    val vesselId: Int,
    val gears: List<GearControlDataInput>,
    val species: List<SpeciesControlDataInput>,
    val year: Int,
)
