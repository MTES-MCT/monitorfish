package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
abstract class InfractionSuspicionOrObservationType(
  val type: ReportingTypeMapping,
  open val reportingActor: ReportingActor,
  open val unit: String? = null,
  open val authorTrigram: String? = null,
  open val authorContact: String? = null,
  open val title: String,
  open val description: String? = null,
  override val natinfCode: String? = null
) : ReportingValue(natinfCode)
