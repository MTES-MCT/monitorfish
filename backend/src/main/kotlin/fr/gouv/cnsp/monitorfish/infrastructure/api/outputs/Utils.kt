package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.district.District

object Utils {
    fun districtsToDepartmentTree (districts: List<District>): List<TreeOptionDataOutput> {
        val departments = districts.map { it.department }.distinct().sorted()

        return departments.map { department -> TreeOptionDataOutput(
            label = department,
            children = districts
                .filter { it.department == department }
                .map { Option(
                    label = it.district,
                    value = it.districtCode
                )})
        }
    }
}
