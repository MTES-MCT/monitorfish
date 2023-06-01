package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC

interface ForeignFMCRepository {
    fun findAll(): List<ForeignFMC>
}
