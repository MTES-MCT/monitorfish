package fr.gouv.cnsp.monitorfish.domain.entities

data class Gear(
        val code: String,
        val name: String,
        val category: String? = null)