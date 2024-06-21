package fr.gouv.cnsp.monitorfish.fakers

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

class VesselFaker {
    companion object {
        fun fakeVessel(index: Int = 1): Vessel {
            return Vessel(
                id = index,
                flagState = CountryCode.FR,
                hasLogbookEsacapt = false,
                internalReferenceNumber = "FAKE_CFR_$index",
                vesselName = "FAKE VESSEL $index",
            )
        }
    }
}
