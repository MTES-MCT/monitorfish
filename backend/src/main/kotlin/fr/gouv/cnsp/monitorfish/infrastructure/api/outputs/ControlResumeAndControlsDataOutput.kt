package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.ControlResumeAndControls

data class ControlResumeAndControlsDataOutput(
        val vesselId: Int,
        val numberOfSeaControls: Int,
        val numberOfLandControls: Int,
        val numberOfAerialControls: Int,
        val numberOfSeizures: Int,
        val numberOfDiversions: Int,
        val numberOfEscortsToQuay: Int,
        val numberOfFishingInfractions: Int,
        val numberOfSecurityInfractions: Int,
        val controls: List<ControlDataOutput>) {
    companion object {
        fun fromControlResumeAndControls(controlResumeAndControls: ControlResumeAndControls) = ControlResumeAndControlsDataOutput(
                vesselId = controlResumeAndControls.vesselId,
                numberOfSeaControls = controlResumeAndControls.numberOfSeaControls,
                numberOfLandControls = controlResumeAndControls.numberOfLandControls,
                numberOfAerialControls = controlResumeAndControls.numberOfAerialControls,
                numberOfDiversions = controlResumeAndControls.numberOfDiversions,
                numberOfSeizures = controlResumeAndControls.numberOfSeizures,
                numberOfEscortsToQuay = controlResumeAndControls.numberOfEscortsToQuay,
                numberOfFishingInfractions = controlResumeAndControls.numberOfFishingInfractions,
                numberOfSecurityInfractions = controlResumeAndControls.numberOfSecurityInfractions,
                controls = controlResumeAndControls.controls.map { ControlDataOutput.fromControl(it) },
        )
    }
}
