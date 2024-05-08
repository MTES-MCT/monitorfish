package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconMalfunctionException
import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.RequestNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.UpdateBeaconMalfunction
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateBeaconMalfunctionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicBeaconMalfunctionController::class)])
class PublicBeaconMalfunctionControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var updateBeaconMalfunction: UpdateBeaconMalfunction

    @MockBean
    private lateinit var requestNotification: RequestNotification

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should return Ok When an update of a beacon malfunction is done`() {
        given(this.updateBeaconMalfunction.execute(123, VesselStatus.AT_SEA, null, null))
            .willReturn(
                BeaconMalfunctionResumeAndDetails(
                    beaconMalfunction = BeaconMalfunction(
                        1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                        "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                        ZonedDateTime.now(), null, ZonedDateTime.now(),
                        beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                    ),
                    comments = listOf(
                        BeaconMalfunctionComment(
                            1,
                            1,
                            "A comment",
                            BeaconMalfunctionCommentUserType.SIP,
                            ZonedDateTime.now(),
                        ),
                    ),
                    actions = listOf(
                        BeaconMalfunctionAction(
                            1,
                            1,
                            BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                            "PREVIOUS",
                            "NEXT",
                            ZonedDateTime.now(),
                        ),
                    ),
                ),
            )

        // When
        api.perform(
            put("/api/v1/beacon_malfunctions/123")
                .content(
                    objectMapper.writeValueAsString(
                        UpdateBeaconMalfunctionDataInput(vesselStatus = VesselStatus.AT_SEA),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.comments.length()", equalTo(1)))
            .andExpect(jsonPath("$.actions.length()", equalTo(1)))
            .andExpect(jsonPath("$.comments[0].comment", equalTo("A comment")))
            .andExpect(jsonPath("$.actions[0].propertyName", equalTo("VESSEL_STATUS")))
            .andExpect(jsonPath("$.beaconMalfunction.internalReferenceNumber", equalTo("CFR")))
    }

    @Test
    fun `Should return Bad request When an update of a beacon malfunction is empty`() {
        given(this.updateBeaconMalfunction.execute(1, null, null, null))
            .willThrow(CouldNotUpdateBeaconMalfunctionException("FAIL"))

        // When
        api.perform(
            put("/api/v1/beacon_malfunctions/123", objectMapper.writeValueAsString(UpdateControlObjectiveDataInput()))
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `Should request a notification`() {
        // When
        api.perform(put("/api/v1/beacon_malfunctions/123/MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION"))
            // Then
            .andExpect(status().isOk)

        verify(requestNotification).execute(
            eq(123),
            eq(BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION),
            eq(null),
        )
    }

    @Test
    fun `Should request a notification to a foreign fmc`() {
        // When
        api.perform(
            put(
                "/api/v1/beacon_malfunctions/123/MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC?requestedNotificationForeignFmcCode=ABC",
            ),
        )
            // Then
            .andExpect(status().isOk)

        verify(requestNotification).execute(
            eq(123),
            eq(BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC),
            eq("ABC"),
        )
    }
}
