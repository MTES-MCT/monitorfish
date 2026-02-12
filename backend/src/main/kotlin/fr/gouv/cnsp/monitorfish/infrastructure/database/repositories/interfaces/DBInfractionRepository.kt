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
            tc.name AS threat_characterization,
            isr.code AS isr_code,
            isr.name AS isr_name
        FROM
            infraction_threat_characterization itc
        INNER JOIN
            infractions i
            ON itc.natinf_code = i.natinf_code
        INNER JOIN
            threat_characterizations tc
            ON itc.threat_characterization_id = tc.id
        INNER JOIN
            threats t
            ON tc.threat_id = t.id
        LEFT JOIN
            isr
            ON itc.isr_code = isr.code
    """,
        nativeQuery = true,
    )
    fun findInfractionsThreatCharacterization(): List<Array<Any>>
}
