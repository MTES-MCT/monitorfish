package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
import java.time.ZonedDateTime
import java.util.Optional
import kotlin.test.Test

class ContractDeserializationUTests {
    private val mapper =
        JsonMapper
            .builder()
            .addModule(KotlinModule.Builder().build())
            .addModule(JavaTimeModule())
            .addModule(Jdk8Module())
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build()

    private val publicMissionActionJson =
        """
        {
          "id": 12,
          "flagState": "FR",
          "missionId": 34,
          "actionType": "SEA_CONTROL",
          "actionDatetimeUtc": "2026-06-10T08:42:00Z",
          "emitsVms": "YES",
          "infractions": [{ "infractionType": "WITH_RECORD", "natinf": 27689, "threat": "Obligations déclaratives" }],
          "gearOnboard": [{ "gearCode": "OTB", "hasUncontrolledMesh": false, "wireType": "SINGLE" }],
          "speciesOnboard": [{ "speciesCode": "SOL", "isNotLanded": true }],
          "discardedSpecies": [{ "speciesCode": "HKE", "discardReason": "DIM", "discardReasonName": "de minimis" }],
          "segments": [{ "segment": "NWW01", "segmentName": "Chalutiers" }],
          "vesselGroups": [{ "id": 1, "name": "Groupe", "color": "#ff0000", "type": "FIXED" }],
          "tripReportings": [{ "id": 5, "type": "ALERT", "threats": [{ "natinfCode": 7059 }] }],
          "controlUnits": [{
            "id": 1, "administration": "DIRM", "isArchived": false, "name": "PAM Jeanne Barret",
            "resources": [{ "id": 2, "name": "Jeanne Barret", "type": "PATROL_BOAT" }]
          }],
          "userTrigram": "LTH",
          "hasSomeGearsSeized": false,
          "hasSomeSpeciesSeized": false,
          "completion": "TO_COMPLETE",
          "isFromPoseidon": false,
          "isLastHaul": false,
          "vesselType": "Chalutier",
          "pnoPurpose": "LAN",
          "someFieldAddedLater": "is ignored"
        }
        """.trimIndent()

    @Test
    fun `PublicMissionActionDataOutput Should be read from the flattened public API payload`() {
        // When
        val output = mapper.readValue<PublicMissionActionDataOutput>(publicMissionActionJson)

        // Then
        assertThat(output.vesselType).isEqualTo("Chalutier")
        assertThat(output.pnoPurpose).isEqualTo(LogbookMessagePurpose.LAN)
        with(output.missionAction) {
            assertThat(id).isEqualTo(12)
            assertThat(flagState).isEqualTo(CountryCode.FR)
            assertThat(actionType).isEqualTo(MissionActionType.SEA_CONTROL)
            assertThat(actionDatetimeUtc.toInstant()).isEqualTo(ZonedDateTime.parse("2026-06-10T08:42:00Z").toInstant())
            assertThat(emitsVms).isEqualTo(ControlCheck.YES)
            assertThat(infractions.single().natinf).isEqualTo(27689)
            assertThat(gearOnboard.single().wireType).isEqualTo(WireType.SINGLE)
            assertThat(speciesOnboard.single().isNotLanded).isTrue()
            assertThat(discardedSpecies.single().discardReason).isEqualTo(DiscardReason.DIM)
            assertThat(segments.single().segment).isEqualTo("NWW01")
            assertThat(vesselGroups.single().type).isEqualTo(GroupType.FIXED)
            assertThat(
                tripReportings
                    .single()
                    .threats
                    .single()
                    .natinfCode,
            ).isEqualTo(7059)
            assertThat(
                controlUnits
                    .single()
                    .resources
                    .single()
                    .type,
            ).isEqualTo(ControlUnitResourceType.PATROL_BOAT)
            assertThat(completion).isEqualTo(Completion.TO_COMPLETE)
        }
    }

    @Test
    fun `MissionActionDataOutput Should be read from the public API payload, ignoring public-only fields`() {
        // When
        val output = mapper.readValue<MissionActionDataOutput>(publicMissionActionJson)

        // Then
        assertThat(output.id).isEqualTo(12)
        assertThat(output.controlUnits.single().name).isEqualTo("PAM Jeanne Barret")
    }

    @Test
    fun `PatchableMissionActionDataInput Should omit untouched fields and send cleared ones as null`() {
        // Given
        val input =
            PatchableMissionActionDataInput(
                actionDatetimeUtc = null,
                actionEndDatetimeUtc = Optional.empty(),
                observationsByUnit = Optional.of("RAS"),
            )

        // When
        val json = mapper.writeValueAsString(input)

        // Then
        assertThat(json).isEqualTo("""{"actionEndDatetimeUtc":null,"observationsByUnit":"RAS"}""")
    }
}
