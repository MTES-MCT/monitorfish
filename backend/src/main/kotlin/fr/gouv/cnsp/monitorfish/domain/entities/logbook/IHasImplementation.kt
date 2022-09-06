package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue

interface IHasImplementation {
  fun getImplementation(): Class<out LogbookMessageValue>
}
