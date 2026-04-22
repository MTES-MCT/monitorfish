package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetReportingWithDMLAndSeaFront(
    private val vesselRepository: VesselRepository,
    private val districtRepository: DistrictRepository,
    private val facadeAreasRepository: FacadeAreasRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetReportingWithDMLAndSeaFront::class.java)

    fun execute(reporting: Reporting): Reporting {
        if (reporting is Reporting.Alert) return reporting

        val vesselId =
            reporting.vesselId
                ?: return withSeaFront(reporting = reporting, seaFront = getFacadeFromCoordinates(reporting))

        val districtCode =
            vesselRepository.findVesselById(vesselId)?.districtCode
                ?: return withSeaFront(reporting = reporting, seaFront = getFacadeFromCoordinates(reporting))

        return try {
            val district = districtRepository.find(districtCode)
            withDistrictData(reporting = reporting, district = district)
        } catch (e: CodeNotFoundException) {
            logger.warn("Could not add DML and sea front for vesselId: $vesselId.", e)

            withSeaFront(reporting, getFacadeFromCoordinates(reporting))
        }
    }

    private fun withDistrictData(
        reporting: Reporting,
        district: District,
    ): Reporting =
        when (reporting) {
            is Reporting.InfractionSuspicion -> reporting.copy(dml = district.dml, seaFront = district.facade)
            is Reporting.Observation -> reporting.copy(dml = district.dml, seaFront = district.facade)
            is Reporting.Alert -> reporting
        }

    private fun withSeaFront(
        reporting: Reporting,
        seaFront: Seafront?,
    ): Reporting =
        when (reporting) {
            is Reporting.InfractionSuspicion -> reporting.copy(seaFront = seaFront?.name)
            is Reporting.Observation -> reporting.copy(seaFront = seaFront?.name)
            is Reporting.Alert -> reporting
        }

    private fun getFacadeFromCoordinates(reporting: Reporting): Seafront? {
        val lat = reporting.latitude ?: return null
        val lon = reporting.longitude ?: return null

        val point = GeometryFactory().createPoint(Coordinate(lon, lat))
        val facade = facadeAreasRepository.findByIncluding(point).firstOrNull()?.facade ?: return null

        return Seafront.from(facade)
    }
}
