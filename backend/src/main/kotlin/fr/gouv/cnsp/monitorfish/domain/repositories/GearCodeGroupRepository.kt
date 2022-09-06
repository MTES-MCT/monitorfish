package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.gear.GearCodeGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException

interface GearCodeGroupRepository {
  fun findAll(): List<GearCodeGroup>

  @Throws(CodeNotFoundException::class)
  fun find(code: String): GearCodeGroup
}
