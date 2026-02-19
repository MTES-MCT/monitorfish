package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.EezAreasRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBEezAreasRepository
import org.locationtech.jts.geom.Point
import org.springframework.stereotype.Repository

@Repository
class JpaEezAreasRepository(
    private val dbEezAreasRepository: DBEezAreasRepository,
) : EezAreasRepository {
    override fun intersectWithFrenchEez(point: Point): Boolean = dbEezAreasRepository.intersectWithFrenchEez(point)
}
