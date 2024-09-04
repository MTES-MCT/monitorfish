package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC

data class ForeignFMCDataOutput(
    var countryCodeIso3: String,
    var countryName: String,
    var emailAddresses: List<String>? = null,
) {
    companion object {
        fun fromForeignFMC(foreignFMC: ForeignFMC) =
            ForeignFMCDataOutput(
                countryCodeIso3 = foreignFMC.countryCodeIso3,
                countryName = foreignFMC.countryName,
                emailAddresses = foreignFMC.emailAddresses,
            )
    }
}
