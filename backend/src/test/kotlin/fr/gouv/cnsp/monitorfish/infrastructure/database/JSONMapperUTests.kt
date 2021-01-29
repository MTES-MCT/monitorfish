package fr.gouv.cnsp.monitorfish.infrastructure.database

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.FAR
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZonedDateTime


@Import(MapperConfiguration::class)
@JsonTest
class JSONMapperUTests {
    //private val mapper = MapperConfiguration().objectMapper()

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `mapper Should deserialize FARMessage When it is first serialized`() {
        // Given
        val catch = Catch()
        catch.economicZone = "FRA"
        catch.effortZone = "C"
        catch.faoZone = "27.8.a"
        catch.statisticalRectangle = "23E6"
        catch.species = "SCR"
        catch.weight = 125.0

        val farMessage = FAR()
        farMessage.gear = "OTB"
        farMessage.catches = listOf(catch)
        farMessage.mesh = 80.0
        farMessage.latitude = 45.389
        farMessage.longitude = -1.303
        farMessage.catchDateTime = Instant.now().minusSeconds(60)

        // When
        val jsonString = mapper.writeValueAsString(farMessage);
        val classType = ERSMessageTypeMapping.getClassFromName("FAR")
        val parsedFARMessage = mapper.readValue(jsonString, classType)

        // Then
        assertThat(parsedFARMessage).isInstanceOf(FAR::class.java)
        parsedFARMessage as FAR

        assertThat(parsedFARMessage.gear).isEqualTo("OTB")
        assertThat(parsedFARMessage.mesh).isEqualTo(80.0)
        assertThat(parsedFARMessage.latitude).isEqualTo(45.389)
        assertThat(parsedFARMessage.longitude).isEqualTo(-1.303)

        val receivedCatch = parsedFARMessage.catches.first()
        assertThat(receivedCatch).isNotNull
        assertThat(receivedCatch.statisticalRectangle).isEqualTo("23E6")
        assertThat(receivedCatch.economicZone).isEqualTo("FRA")
        assertThat(receivedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(receivedCatch.species).isEqualTo("SCR")
        assertThat(receivedCatch.weight).isEqualTo(125.0)
    }

    @Test
    fun `mapper Should deserialize an example FAR message`() {
        // Given
        val farMessage = "{\"gear\": \"GTN\", \"mesh\": 100.0, \"catches\": [" +
                "{\"weight\": 2.0, \"nbFish\": null, \"species\": \"SCL\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 10.0, \"nbFish\": null, \"species\": \"BRB\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 1.5, \"nbFish\": null, \"species\": \"LBE\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 18.0, \"nbFish\": null, \"species\": \"BSS\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 5.0, \"nbFish\": null, \"species\": \"SWA\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 30.0, \"nbFish\": null, \"species\": \"BIB\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 8.0, \"nbFish\": null, \"species\": \"COE\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 4.0, \"nbFish\": null, \"species\": \"SOL\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 1.0, \"nbFish\": null, \"species\": \"MKG\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 10.0, \"nbFish\": null, \"species\": \"MNZ\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 70.0, \"nbFish\": null, \"species\": \"POL\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 40.0, \"nbFish\": null, \"species\": \"USB\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 15.0, \"nbFish\": null, \"species\": \"RJH\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
                "{\"weight\": 15.0, \"nbFish\": null, \"species\": \"WHG\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}], \"farDatetimeUtc\": \"2019-12-05 11:55\"" +
                "}"

        // When
        val classType = ERSMessageTypeMapping.getClassFromName("FAR")
        val parsedFARMessage = mapper.readValue(farMessage, classType)

        // Then
        assertThat(parsedFARMessage).isInstanceOf(FAR::class.java)
        parsedFARMessage as FAR

        assertThat(parsedFARMessage.gear).isEqualTo("GTN")
        assertThat(parsedFARMessage.mesh).isEqualTo(100.0)
        assertThat(parsedFARMessage.catchDateTime.toString()).isEqualTo("2019-12-05T11:55:00Z")
        assertThat(parsedFARMessage.catches).hasSize(14)

        val receivedCatch = parsedFARMessage.catches.first()
        assertThat(receivedCatch).isNotNull
        assertThat(receivedCatch.statisticalRectangle).isEqualTo("23E6")
        assertThat(receivedCatch.effortZone).isEqualTo("C")
        assertThat(receivedCatch.economicZone).isEqualTo("FRA")
        assertThat(receivedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(receivedCatch.species).isEqualTo("SCL")
        assertThat(receivedCatch.weight).isEqualTo(2.0)
    }
}
