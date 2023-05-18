package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.ParseAndSavePosition
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(WebSecurityConfig::class, OIDCProperties::class)
@WebMvcTest(value = [(ApiController::class)])
class ApiControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var parseAndSavePosition: ParseAndSavePosition

    @Test
    fun `A bad NAF param Should return 200 for the sender not to be worried`() {
        // Given
        given(parseAndSavePosition.execute(anyString())).willAnswer { throw NAFMessageParsingException("ARGH", "NAF") }

        // When
        val body = api.perform(post("/api/v1/positions").content("TEST"))
            // Then
            .andExpect(status().isOk)
            .andReturn().response.contentAsString

        assertThat(body).contains("ARGH for NAF message")
    }

    @Test
    fun `A valid NAF param Should return 201`() {
        // Given
        val naf = "//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER//"

        // When
        api.perform(post("/api/v1/positions").content(naf))
            // Then
            .andExpect(status().isCreated)
    }
}
