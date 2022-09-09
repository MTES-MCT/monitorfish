package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase

@UseCase
class DeleteReportings(private val deleteReporting: DeleteReporting) {
    fun execute(ids: List<Int>) {
        ids.forEach {
            deleteReporting.execute(it)
        }
    }
}
