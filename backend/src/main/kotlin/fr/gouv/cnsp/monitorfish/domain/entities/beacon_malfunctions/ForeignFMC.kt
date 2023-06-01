package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

data class ForeignFMC(
    val countryCodeIso3: String,
    val countryName: String,
    val emailAddresses: List<String>? = null,
)
