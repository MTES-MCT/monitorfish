package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyLastPositions(): List<LastPosition> {
        val now = ZonedDateTime.now().minusDays(1)

        val firstPosition =
            LastPosition(
                id = null,
                vesselId = 1,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = CountryCode.FR,
                positionType = PositionType.AIS,
                segments = listOf("NWW03", "NWW06"),
                latitude = 16.445,
                longitude = 48.2525,
                estimatedCurrentLatitude = 1.8,
                estimatedCurrentLongitude = 180.0,
                lastLogbookMessageDateTime = ZonedDateTime.now(),
                length = 12.6,
                gearOnboard =
                    listOf(
                        Gear().apply {
                            this.gear = "OTB"
                        },
                    ),
                speciesOnboard =
                    listOf(
                        Species().apply {
                            this.species = "AMZ"
                        },
                        Species().apply {
                            this.species = "HKE"
                        },
                    ),
                isAtPort = false,
                dateTime =
                    now.minusHours(
                        4,
                    ),
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )
        val secondPosition =
            LastPosition(
                id = null,
                vesselId = null,
                internalReferenceNumber = "FR123456785",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = CountryCode.FR,
                positionType = PositionType.AIS,
                latitude = 16.445,
                longitude = 48.2525,
                estimatedCurrentLatitude = 1.8,
                estimatedCurrentLongitude = 180.0,
                length = 12.6,
                gearOnboard =
                    listOf(
                        Gear().apply {
                            this.gear = "OTT"
                        },
                    ),
                dateTime =
                    now.minusHours(
                        3,
                    ),
                isAtPort = false,
                speciesOnboard =
                    listOf(
                        Species().apply {
                            this.species = "LSS"
                        },
                        Species().apply {
                            this.species = "BHG"
                        },
                    ),
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )
        val thirdPosition =
            LastPosition(
                id = null,
                vesselId = null,
                internalReferenceNumber = "FR224226856",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = CountryCode.FR,
                positionType = PositionType.AIS,
                latitude = 16.445,
                longitude = 48.2525,
                estimatedCurrentLatitude = 1.8,
                estimatedCurrentLongitude = 180.0,
                lastLogbookMessageDateTime = ZonedDateTime.now(),
                length = 9.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
                isAtPort = false,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )
        val fourthPosition =
            LastPosition(
                id = null,
                vesselId = null,
                internalReferenceNumber = "FR224226857",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = CountryCode.FR,
                positionType = PositionType.AIS,
                latitude = 16.445,
                longitude = 48.2525,
                estimatedCurrentLatitude = 1.8,
                estimatedCurrentLongitude = 180.0,
                lastLogbookMessageDateTime = ZonedDateTime.now(),
                length = 12.0,
                isAtPort = false,
                dateTime =
                    now.minusHours(
                        1,
                    ),
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        return listOf(firstPosition, secondPosition, thirdPosition, fourthPosition)
    }

    fun getDummyPositions(baseDateTime: ZonedDateTime): List<Position> {
        val firstPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    baseDateTime.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    baseDateTime.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    baseDateTime.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    baseDateTime.minusHours(
                        1,
                    ),
            )

        return listOf(firstPosition, secondPosition, thirdPosition, fourthPosition)
    }
}
