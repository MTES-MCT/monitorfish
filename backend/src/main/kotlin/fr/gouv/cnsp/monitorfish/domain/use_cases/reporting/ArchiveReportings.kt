package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase

@UseCase
class ArchiveReportings(private val archiveReporting: ArchiveReporting) {
    fun execute(ids: List<Int>) {
       ids.forEach {
           archiveReporting.execute(it)
       }
    }
}
