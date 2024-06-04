package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import com.fasterxml.jackson.annotation.JsonTypeName
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

@JsonTypeName("pnoAndLanCatches")
data class PNOAndLANCatches(
    var pno: LogbookFishingCatch? = null,
    var lan: LogbookFishingCatch? = null,
)
