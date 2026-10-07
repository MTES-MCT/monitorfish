package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselAndBeacon
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.VesselIdentityDataOutput

fun Vessel.toVesselIdentityDataOutput() =
    VesselIdentityDataOutput(
        districtCode = districtCode,
        externalReferenceNumber = externalReferenceNumber,
        flagState = flagState,
        internalReferenceNumber = internalReferenceNumber,
        ircs = ircs,
        mmsi = mmsi,
        vesselId = id,
        vesselLength = length,
        vesselName = vesselName,
    )

fun VesselAndBeacon.toVesselIdentityDataOutput() =
    vessel.toVesselIdentityDataOutput().copy(beaconNumber = beacon?.beaconNumber)
