package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.district.District

data class TreeOptionDataOutput (
    val label: String,
    val children: List<Option>
) {
    companion object {
        fun fromDistricts(districts: List<District>): List<TreeOptionDataOutput> {
            val departments = districts.map { it.department }.distinct().sorted()

            return departments.map { department -> TreeOptionDataOutput(
                label = department,
                children = districts
                    .filter { it.department == department }
                    .map { Option(
                        label = it.district,
                        value = it.districtCode
                    )}.sortedBy { it.label })

            }
        }
    }
}

data class Option (
    val label: String,
    val value: String
)
