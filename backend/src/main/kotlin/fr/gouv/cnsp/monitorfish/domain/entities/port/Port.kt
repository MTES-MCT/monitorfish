package fr.gouv.cnsp.monitorfish.domain.entities.port

data class Port(val locode: String, val name: String, val faoAreas: List<String> = listOf())
