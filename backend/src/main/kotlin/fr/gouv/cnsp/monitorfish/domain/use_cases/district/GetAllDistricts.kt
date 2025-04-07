package fr.gouv.cnsp.monitorfish.domain.use_cases.district

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository

@UseCase
class GetAllDistricts(
    private val districtRepository: DistrictRepository
) {
    fun execute(): List<District> = districtRepository.findAll()
}
