package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface DistrictRepository {
    @Throws(CodeNotFoundException::class)
    fun find(districtCode: String): District
}
