package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBInfractionRepository : CrudRepository<InfractionEntity, Long> {
    fun findByNatinfCodeEquals(natinfCode: Int): InfractionEntity

    @Query(
        """
        SELECT
            itc.natinf_code AS natinf_code,
            i.infraction AS infraction,
            t.name AS threat,
            tc.name AS threat_characterization
        FROM
            infraction_threat_characterization itc
        INNER JOIN
            infractions i
            ON itc.natinf_code = i.natinf_code
        INNER JOIN
            threats t
            ON itc.threat_id = t.id
        INNER JOIN
            threat_characterizations tc
            ON itc.threat_characterization_id = tc.id
    """,
        nativeQuery = true,
    )
    fun findInfractionsThreatCharacterization(): List<Array<Any>>
}
