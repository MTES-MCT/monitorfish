package fr.gouv.cnsp.monitorfish.infrastructure.api.referential

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.RegulatoryCatalogueRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.gear.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SpeciesAndSpeciesGroupsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.toPortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component

/**
 * The referentials as served, with their version.
 *
 * The versions are computed once per content: when a snapshot is cached, i.e. after an invalidation by the writer of
 * the referential (see [Referential.cacheNames]) or at the expiry of its cache. The gears are computed on each request,
 * as they depend on the fleet segments of the current year, edited in the backoffice.
 */
@Component
class ReferentialSnapshots(
    private val getActivePorts: GetActivePorts,
    private val getAllGears: GetAllGears,
    private val getAllInfractions: GetAllInfractions,
    private val getAllSpeciesAndSpeciesGroups: GetAllSpeciesAndSpeciesGroups,
    private val objectMapper: ObjectMapper,
    private val regulatoryCatalogueRepository: RegulatoryCatalogueRepository,
) {
    fun gears(): VersionedReferential<List<GearDataOutput>> =
        versioned(getAllGears.execute().map { GearDataOutput.fromGear(it) })

    @Cacheable(value = [CacheName.REFERENTIAL_INFRACTIONS], sync = true)
    fun infractions(): VersionedReferential<List<InfractionDataOutput>> =
        versioned(getAllInfractions.execute().map { InfractionDataOutput.fromInfraction(it) })

    @Cacheable(value = [CacheName.REFERENTIAL_PORTS], sync = true)
    fun ports(): VersionedReferential<List<PortDataOutput>> =
        versioned(getActivePorts.execute().map { it.toPortDataOutput() })

    @Cacheable(value = [CacheName.REFERENTIAL_REGULATIONS], sync = true)
    fun regulations(): VersionedReferential<String> {
        val geoJson = regulatoryCatalogueRepository.findAllAsGeoJson()

        return VersionedReferential.of(geoJson, geoJson.toByteArray())
    }

    @Cacheable(value = [CacheName.REFERENTIAL_SPECIES], sync = true)
    fun species(): VersionedReferential<SpeciesAndSpeciesGroupsDataOutput> =
        versioned(
            SpeciesAndSpeciesGroupsDataOutput.fromSpeciesAndSpeciesGroups(getAllSpeciesAndSpeciesGroups.execute()),
        )

    private fun <T : Any> versioned(data: T): VersionedReferential<T> =
        VersionedReferential.of(data, objectMapper.writeValueAsBytes(data))
}
