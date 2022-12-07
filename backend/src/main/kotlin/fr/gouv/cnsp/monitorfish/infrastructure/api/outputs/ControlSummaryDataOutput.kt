package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.controls.ControlSummary

data class ControlSummaryDataOutput(
    val vesselId: Int,
    val numberOfSeaControls: Int,
    val numberOfLandControls: Int,
    val numberOfAerialControls: Int,
    val numberOfSeizures: Int,
    val numberOfDiversions: Int,
    val numberOfEscortsToQuay: Int,
    val numberOfFishingInfractions: Int,
    val numberOfSecurityInfractions: Int,
    val controls: List<ControlDataOutput>
) {
    companion object {
        fun fromControlSummary(controlSummary: ControlSummary) = ControlSummaryDataOutput(
            vesselId = controlSummary.vesselId,
            numberOfSeaControls = controlSummary.numberOfSeaControls,
            numberOfLandControls = controlSummary.numberOfLandControls,
            numberOfAerialControls = controlSummary.numberOfAerialControls,
            numberOfDiversions = controlSummary.numberOfDiversions,
            numberOfSeizures = controlSummary.numberOfSeizures,
            numberOfEscortsToQuay = controlSummary.numberOfEscortsToQuay,
            numberOfFishingInfractions = controlSummary.numberOfFishingInfractions,
            numberOfSecurityInfractions = controlSummary.numberOfSecurityInfractions,
            controls = controlSummary.controls.map { ControlDataOutput.fromControl(it) }
        )
    }
}
