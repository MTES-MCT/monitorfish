package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "districts")
data class DistrictEntity(
    @Id
    @Column(name = "district_code")
    val districtCode: String,
    @Column(name = "district")
    val district: String,
    @Column(name = "department_code")
    val departmentCode: String,
    @Column(name = "department")
    val department: String,
    @Column(name = "dml")
    val dml: String? = null,
    @Column(name = "facade")
    val facade: String? = null,
) {

    fun toDistrict() = District(
        districtCode = districtCode,
        district = district,
        departmentCode = departmentCode,
        department = department,
        dml = dml,
        facade = facade,
    )
}
