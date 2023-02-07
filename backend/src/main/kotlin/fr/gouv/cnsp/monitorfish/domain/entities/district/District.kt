package fr.gouv.cnsp.monitorfish.domain.entities.district

data class District(
    val districtCode: String,
    val district: String,
    val departmentCode: String,
    val department: String,
    val dml: String? = null,
    val facade: String? = null,
)
