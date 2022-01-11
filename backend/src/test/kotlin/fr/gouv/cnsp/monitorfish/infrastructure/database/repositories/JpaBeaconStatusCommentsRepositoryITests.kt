package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaBeaconStatusCommentsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconStatusCommentsRepository: JpaBeaconStatusCommentsRepository

    @Test
    @Transactional
    fun `findAllByBeaconStatusId Should return all comments for a given beacon status`() {
        // When
        val comments = jpaBeaconStatusCommentsRepository.findAllByBeaconStatusId(1)

        assertThat(comments).hasSize(2)
        assertThat(comments.last().id).isEqualTo(2)
        assertThat(comments.last().beaconStatusId).isEqualTo(1)
        assertThat(comments.last().comment).isEqualTo("La pêche profonde résulte directement de l’épuisement " +
                "des ressources marines dans les eaux de surface. Après avoir surexploité les stocks de poissons en surface, " +
                "les flottes de pêche industrielles se sont tournées vers les grands fonds pour trouver la ressource qui leur faisait défaut.")
        assertThat(comments.last().dateTime).isNotNull
        assertThat(comments.last().userType).isEqualTo(BeaconStatusCommentUserType.SIP)
    }

    @Test
    @Transactional
    fun `save Should save a comment for a given beacon status`() {
        // Given
        assertThat(jpaBeaconStatusCommentsRepository.findAllByBeaconStatusId(1)).hasSize(2)

        // When
        val comment = BeaconStatusComment(
                null,
                1,
                "A comment",
                BeaconStatusCommentUserType.SIP,
                ZonedDateTime.now())
        jpaBeaconStatusCommentsRepository.save(comment)

        // Then
        assertThat(jpaBeaconStatusCommentsRepository.findAllByBeaconStatusId(1)).hasSize(3)
    }
}
