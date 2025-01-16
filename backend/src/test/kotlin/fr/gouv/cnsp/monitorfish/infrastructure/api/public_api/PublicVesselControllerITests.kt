package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicVesselController::class)])
class PublicVesselControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var searchVessels: SearchVessels

    @Test
    fun `Should search for a vessel`() {
        // Given
        given(this.searchVessels.execute(any())).willReturn(
            listOf(
                VesselAndBeacon(
                    vessel =
                        Vessel(
                            id = 1,
                            internalReferenceNumber = "FR224226850",
                            vesselName = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            declaredFishingGears = listOf("Trémails"),
                            vesselType = "Fishing",
                            hasLogbookEsacapt = false,
                        ),
                    beacon = Beacon(beaconNumber = "123456", vesselId = 1),
                ),
                VesselAndBeacon(
                    vessel =
                        Vessel(
                            id = 2,
                            internalReferenceNumber = "GBR21555445",
                            vesselName = "ANOTHER VESSEL",
                            flagState = CountryCode.GB,
                            declaredFishingGears = listOf("Trémails"),
                            vesselType = "Fishing",
                            hasLogbookEsacapt = false,
                        ),
                    beacon = null,
                ),
            ),
        )

        // When
        api
            .perform(get("/api/v1/vessels/search?searched=VESSEL"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].flagState", equalTo("FR")))
            .andExpect(jsonPath("$[0].vesselName", equalTo("MY AWESOME VESSEL")))
            .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$[0].beaconNumber", equalTo("123456")))
            .andExpect(jsonPath("$[1].flagState", equalTo("GB")))
            .andExpect(jsonPath("$[1].vesselName", equalTo("ANOTHER VESSEL")))
            .andExpect(jsonPath("$[1].internalReferenceNumber", equalTo("GBR21555445")))

        Mockito.verify(searchVessels).execute("VESSEL")
    }
}
