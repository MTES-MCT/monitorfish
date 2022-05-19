package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.gear.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFAOAreas
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SpeciesAndSpeciesGroupsDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff")
@Api(description = "APIs for Data referential")
class DataReferentialController(
        private val getAllGears: GetAllGears,
        private val getAllSpeciesAndSpeciesGroups: GetAllSpeciesAndSpeciesGroups,
        private val getFAOAreas: GetFAOAreas) {

    @GetMapping("/v1/gears")
    @ApiOperation("Get FAO fishing gear codes")
    fun getGears(): List<GearDataOutput> {
        return getAllGears.execute().map { gear ->
            GearDataOutput.fromGear(gear)
        }
    }

    @GetMapping("/v1/species")
    @ApiOperation("Get FAO species codes and groups")
    fun getSpecies(): SpeciesAndSpeciesGroupsDataOutput {
        return SpeciesAndSpeciesGroupsDataOutput.fromSpeciesAndSpeciesGroups(getAllSpeciesAndSpeciesGroups.execute())
    }

    @GetMapping("/v1/fao_areas")
    @ApiOperation("Get FAO areas")
    fun getFAOAreas(): List<String> {
        return getFAOAreas.execute()
    }
}
