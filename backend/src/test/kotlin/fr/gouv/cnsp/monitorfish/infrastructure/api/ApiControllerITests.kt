package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.ReceivePosition
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(ApiController::class)])
class ApiControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var receivePosition: ReceivePosition

    @Test
    fun `A bad NAF param Should return 200 for the sender to not be worried`() {
        // When
        val body = mockMvc.perform(post("/api/v1/positions").content("TEST"))
                // Then
                .andExpect(status().isOk)
                .andReturn().response.contentAsString

        assertThat(body).contains("No date or time fields found")
    }

    @Test
    fun `A valid NAF param Should return 201`() {
        // Given
        val naf = "//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER"

        // When
        mockMvc.perform(post("/api/v1/positions").content(naf))
                // Then
                .andExpect(status().isCreated)
    }
}