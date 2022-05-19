package fr.gouv.cnsp.monitorfish.domain.entities.controls

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Control

data class ControlResumeAndControls(
        val vesselId: Int,
        val numberOfSeaControls: Int,
        val numberOfLandControls: Int,
        val numberOfAerialControls: Int,
        val numberOfSeizures: Int,
        val numberOfDiversions: Int,
        val numberOfEscortsToQuay: Int,
        val numberOfFishingInfractions: Int,
        val numberOfSecurityInfractions: Int,
        val controls: List<Control>)
