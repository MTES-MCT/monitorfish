package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.MeterRegistryConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconMalfunctionException
import fr.gouv.cnsp.monitorfish.domain.use_cases.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SaveBeaconMalfunctionCommentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateBeaconMalfunctionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(MeterRegistryConfiguration::class)
@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(BeaconMalfunctionController::class)])
class BeaconMalfunctionControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getAllBeaconMalfunctions: GetAllBeaconMalfunctions

    @MockBean
    private lateinit var updateBeaconMalfunction: UpdateBeaconMalfunction

    @MockBean
    private lateinit var getBeaconMalfunction: GetBeaconMalfunction

    @MockBean
    private lateinit var saveBeaconMalfunctionComment: SaveBeaconMalfunctionComment

    @MockBean
    private lateinit var getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all beacon malfunctions`() {
        // Given
        given(this.getAllBeaconMalfunctions.execute()).willReturn(listOf(BeaconMalfunction(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                true, ZonedDateTime.now(), null, ZonedDateTime.now())))

        // When
        mockMvc.perform(get("/bff/v1/beacon_malfunctions"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", equalTo(1)))
                .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo("CFR")))
                .andExpect(jsonPath("$[0].vesselStatus", equalTo("AT_SEA")))
                .andExpect(jsonPath("$[0].stage", equalTo("INITIAL_ENCOUNTER")))
    }

    @Test
    fun `Should return Created When an update of a beacon malfunction is done`() {
        given(this.updateBeaconMalfunction.execute(123, VesselStatus.AT_SEA, null, null))
                .willReturn(BeaconMalfunctionResumeAndDetails(
                        beaconMalfunction = BeaconMalfunction(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                                "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                        comments = listOf(BeaconMalfunctionComment(1, 1, "A comment", BeaconMalfunctionCommentUserType.SIP, ZonedDateTime.now())),
                        actions = listOf(BeaconMalfunctionAction(1, 1, BeaconMalfunctionActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now()))))

        // When
        mockMvc.perform(put("/bff/v1/beacon_malfunctions/123")
                .content(objectMapper.writeValueAsString(UpdateBeaconMalfunctionDataInput(vesselStatus = VesselStatus.AT_SEA)))
                .contentType(MediaType.APPLICATION_JSON))
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
        mockMvc.perform(put("/bff/v1/beacon_malfunctions/123", objectMapper.writeValueAsString(UpdateControlObjectiveDataInput()))
                .contentType(MediaType.APPLICATION_JSON))
                // Then
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `Should return a beacon malfunction`() {
        given(this.getBeaconMalfunction.execute(123))
                .willReturn(BeaconMalfunctionResumeAndDetails(
                        beaconMalfunction = BeaconMalfunction(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                                "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                        resume = VesselBeaconMalfunctionsResume(1, 2, null, null),
                        comments = listOf(BeaconMalfunctionComment(1, 1, "A comment", BeaconMalfunctionCommentUserType.SIP, ZonedDateTime.now())),
                        actions = listOf(BeaconMalfunctionAction(1, 1, BeaconMalfunctionActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now()))))

        // When
        mockMvc.perform(get("/bff/v1/beacon_malfunctions/123"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.resume.numberOfBeaconsAtSea", equalTo(1)))
                .andExpect(jsonPath("$.comments.length()", equalTo(1)))
                .andExpect(jsonPath("$.actions.length()", equalTo(1)))
                .andExpect(jsonPath("$.comments[0].comment", equalTo("A comment")))
                .andExpect(jsonPath("$.actions[0].propertyName", equalTo("VESSEL_STATUS")))
                .andExpect(jsonPath("$.beaconMalfunction.internalReferenceNumber", equalTo("CFR")))
    }

    @Test
    fun `Should return a beacon malfunction without a resume`() {
        given(this.getBeaconMalfunction.execute(123))
                .willReturn(BeaconMalfunctionResumeAndDetails(
                        beaconMalfunction = BeaconMalfunction(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                                "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                                true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                        comments = listOf(BeaconMalfunctionComment(1, 1, "A comment", BeaconMalfunctionCommentUserType.SIP, ZonedDateTime.now())),
                        actions = listOf(BeaconMalfunctionAction(1, 1, BeaconMalfunctionActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now()))))

        // When
        mockMvc.perform(get("/bff/v1/beacon_malfunctions/123"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.resume", equalTo(null)))
                .andExpect(jsonPath("$.comments.length()", equalTo(1)))
                .andExpect(jsonPath("$.actions.length()", equalTo(1)))
                .andExpect(jsonPath("$.comments[0].comment", equalTo("A comment")))
                .andExpect(jsonPath("$.actions[0].propertyName", equalTo("VESSEL_STATUS")))
                .andExpect(jsonPath("$.beaconMalfunction.internalReferenceNumber", equalTo("CFR")))
    }

    @Test
    fun `Should save a beacon malfunction comment`() {
        given(this.saveBeaconMalfunctionComment.execute(any(), any(), any())).willReturn(BeaconMalfunctionResumeAndDetails(
                beaconMalfunction = BeaconMalfunction(1, "CFR", "EXTERNAL_IMMAT", "IRCS",
                        "fr", VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "BIDUBULE", VesselStatus.AT_SEA, Stage.INITIAL_ENCOUNTER,
                        true, ZonedDateTime.now(), null, ZonedDateTime.now()),
                comments = listOf(BeaconMalfunctionComment(1, 1, "A comment", BeaconMalfunctionCommentUserType.SIP, ZonedDateTime.now())),
                actions = listOf(BeaconMalfunctionAction(1, 1, BeaconMalfunctionActionPropertyName.VESSEL_STATUS, "PREVIOUS", "NEXT", ZonedDateTime.now()))))

        // When
        mockMvc.perform(post("/bff/v1/beacon_malfunctions/123/comments")
                .content(objectMapper.writeValueAsString(SaveBeaconMalfunctionCommentDataInput("A comment", BeaconMalfunctionCommentUserType.SIP)))
                .contentType(MediaType.APPLICATION_JSON))
                // Then
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.comments.length()", equalTo(1)))
                .andExpect(jsonPath("$.comments[0].comment", equalTo("A comment")))
                .andExpect(jsonPath("$.beaconMalfunction.internalReferenceNumber", equalTo("CFR")))
    }

}
