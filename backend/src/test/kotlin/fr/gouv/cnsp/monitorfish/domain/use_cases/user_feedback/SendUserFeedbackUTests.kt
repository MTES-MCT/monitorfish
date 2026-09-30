package fr.gouv.cnsp.monitorfish.domain.use_cases.user_feedback

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.repositories.UserFeedbackRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class SendUserFeedbackUTests {
    @MockitoBean
    private lateinit var userFeedbackRepository: UserFeedbackRepository

    @Test
    fun `execute Should send the trimmed feedback`() {
        // When
        SendUserFeedback(userFeedbackRepository).execute(
            message = "  Super outil !  ",
            userEmail = "user@example.com",
            pageUrl = "https://monitorfish.din.developpement-durable.gouv.fr/backoffice",
        )

        // Then
        verify(userFeedbackRepository).send(
            UserFeedback(
                message = "Super outil !",
                userEmail = "user@example.com",
                pageUrl = "https://monitorfish.din.developpement-durable.gouv.fr/backoffice",
            ),
        )
    }

    @Test
    fun `execute Should throw When the message is blank`() {
        // When
        val throwable =
            catchThrowable {
                SendUserFeedback(userFeedbackRepository).execute(" \n ", "user@example.com", null)
            }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        verify(userFeedbackRepository, never()).send(any())
    }

    @Test
    fun `execute Should throw When the message is too long`() {
        // When
        val throwable =
            catchThrowable {
                SendUserFeedback(userFeedbackRepository).execute(
                    "a".repeat(SendUserFeedback.MESSAGE_MAX_LENGTH + 1),
                    "user@example.com",
                    null,
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        verify(userFeedbackRepository, never()).send(any())
    }
}
