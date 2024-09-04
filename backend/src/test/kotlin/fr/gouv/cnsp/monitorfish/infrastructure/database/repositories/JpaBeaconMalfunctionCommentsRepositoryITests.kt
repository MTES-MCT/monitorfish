package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionCommentUserType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaBeaconMalfunctionCommentsRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaBeaconMalfunctionCommentsRepository: JpaBeaconMalfunctionCommentsRepository

    @Test
    @Transactional
    fun `findAllByBeaconMalfunctionId Should return all comments for a given beacon malfunction`() {
        // When
        val comments = jpaBeaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(1)

        assertThat(comments).hasSize(2)
        assertThat(comments.last().id).isEqualTo(2)
        assertThat(comments.last().beaconMalfunctionId).isEqualTo(1)
        assertThat(comments.last().comment).isEqualTo(
            "La pêche profonde résulte directement de l’épuisement " +
                "des ressources marines dans les eaux de surface. Après avoir surexploité les stocks de poissons en surface, " +
                "les flottes de pêche industrielles se sont tournées vers les grands fonds pour trouver la ressource qui leur faisait défaut.",
        )
        assertThat(comments.last().dateTime).isNotNull
        assertThat(comments.last().userType).isEqualTo(BeaconMalfunctionCommentUserType.SIP)
    }

    @Test
    @Transactional
    fun `save Should save a comment for a given beacon malfunction`() {
        // Given
        assertThat(jpaBeaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(1)).hasSize(2)

        // When
        val comment =
            BeaconMalfunctionComment(
                null,
                1,
                "A comment",
                BeaconMalfunctionCommentUserType.SIP,
                ZonedDateTime.now(),
            )
        jpaBeaconMalfunctionCommentsRepository.save(comment)

        // Then
        assertThat(jpaBeaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(1)).hasSize(3)
    }
}
