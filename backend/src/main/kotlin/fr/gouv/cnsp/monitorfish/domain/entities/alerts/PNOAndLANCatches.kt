package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import com.fasterxml.jackson.annotation.JsonTypeName
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch

@JsonTypeName("pnoAndLanCatches")
data class PNOAndLANCatches(
    var pno: Catch? = null,
    var lan: Catch? = null,
)
