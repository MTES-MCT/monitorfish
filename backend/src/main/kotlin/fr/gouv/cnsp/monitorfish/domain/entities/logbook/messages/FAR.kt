package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Haul

class FAR() : LogbookMessageValue {
    var hauls: List<Haul> = listOf()
}
