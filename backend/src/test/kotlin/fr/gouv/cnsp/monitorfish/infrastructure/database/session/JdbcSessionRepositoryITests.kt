package fr.gouv.cnsp.monitorfish.infrastructure.database.session

import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.session.Session
import org.springframework.session.SessionRepository
import org.springframework.session.jdbc.JdbcIndexedSessionRepository
import org.springframework.session.web.http.CookieSerializer

class JdbcSessionRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jdbcSessionRepository: JdbcIndexedSessionRepository

    @Suppress("UNCHECKED_CAST")
    private val sessionRepository get() = jdbcSessionRepository as SessionRepository<Session>

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var cookieSerializer: CookieSerializer

    @AfterEach
    fun deleteSessions() {
        jdbcTemplate.update("DELETE FROM spring_session")
    }

    @Test
    fun `Should save and find a session in the database`() {
        // Given
        val session = sessionRepository.createSession()
        session.setAttribute("email", "user@example.com")

        // When
        sessionRepository.save(session)
        val foundSession = sessionRepository.findById(session.id)

        // Then
        assertThat(foundSession?.getAttribute<String>("email")).isEqualTo("user@example.com")
    }

    @Test
    fun `Should drop a session attribute that can not be deserialized`() {
        // Given
        val session = sessionRepository.createSession()
        session.setAttribute("email", "user@example.com")
        sessionRepository.save(session)
        jdbcTemplate.update(
            "UPDATE spring_session_attributes SET attribute_bytes = '\\x00'::bytea WHERE attribute_name = 'email'",
        )

        // When
        val foundSession = sessionRepository.findById(session.id)

        // Then
        assertThat(foundSession).isNotNull()
        assertThat(foundSession?.getAttribute<String>("email")).isNull()
    }

    @Test
    fun `Should write the session cookie without SameSite attribute, as the former Tomcat session cookie`() {
        // Given
        val response = MockHttpServletResponse()

        // When
        cookieSerializer.writeCookieValue(CookieSerializer.CookieValue(MockHttpServletRequest(), response, "id"))

        // Then
        val setCookieHeader = response.getHeader("Set-Cookie")
        assertThat(setCookieHeader).startsWith("SESSION=")
        assertThat(setCookieHeader).doesNotContainIgnoringCase("SameSite")
    }
}
