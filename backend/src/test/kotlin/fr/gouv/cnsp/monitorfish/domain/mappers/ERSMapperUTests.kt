package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Haul
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import

@Import(MapperConfiguration::class)
@JsonTest
class ERSMapperUTests {

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `getERSMessageValueFromJSON Should not throw an exception When the message value is null`() {
        // When
        val parsedFARMessage = ERSMapper.getERSMessageValueFromJSON(mapper, "null", "INS", LogbookOperationType.DAT)

        // Then
        assertThat(parsedFARMessage).isNull()
    }

    @Test
    fun `getERSMessageValueFromJSON Should deserialize FARMessage When it is first serialized`() {
        // Given
        val catch = Catch()
        catch.economicZone = "FRA"
        catch.effortZone = "C"
        catch.faoZone = "27.8.a"
        catch.statisticalRectangle = "23E6"
        catch.species = "SCR"
        catch.weight = 125.0

        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catch)
        haul.mesh = 80.0
        haul.latitude = 45.389
        haul.longitude = -1.303
        val farMessage = FAR()
        farMessage.hauls = listOf(haul)

        // When
        val jsonString = mapper.writeValueAsString(farMessage)
        val parsedFARMessage = ERSMapper.getERSMessageValueFromJSON(mapper, jsonString, "FAR", LogbookOperationType.DAT)

        // Then
        assertThat(parsedFARMessage).isInstanceOf(FAR::class.java)
        parsedFARMessage as FAR

        val parsedHauls = parsedFARMessage.hauls
        assertThat(parsedHauls.size).isEqualTo(1)

        val parsedhaul = parsedHauls.first()

        assertThat(parsedhaul.gear).isEqualTo("OTB")
        assertThat(parsedhaul.mesh).isEqualTo(80.0)
        assertThat(parsedhaul.latitude).isEqualTo(45.389)
        assertThat(parsedhaul.longitude).isEqualTo(-1.303)

        val receivedCatch = parsedhaul.catches.first()
        assertThat(receivedCatch).isNotNull
        assertThat(receivedCatch.statisticalRectangle).isEqualTo("23E6")
        assertThat(receivedCatch.economicZone).isEqualTo("FRA")
        assertThat(receivedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(receivedCatch.species).isEqualTo("SCR")
        assertThat(receivedCatch.weight).isEqualTo(125.0)
    }

    @Test
    fun `getERSMessageValueFromJSON Should deserialize an example FAR message`() {
        // Given
        val farMessage = "{\"hauls\":[{\"gear\": \"GTN\", \"mesh\": 100.0, \"catches\": [" +
            "{\"weight\": 2.0, \"conversionFactor\": 1.0, \"nbFish\": null, \"species\": \"SCL\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
            "{\"weight\": 10.0, \"conversionFactor\": 1.0, \"nbFish\": null, \"species\": \"BRB\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}, " +
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
            "{\"weight\": 15.0, \"nbFish\": null, \"species\": \"WHG\", \"faoZone\": \"27.8.a\", \"effortZone\": \"C\", \"economicZone\": \"FRA\", \"statisticalRectangle\": \"23E6\"}], \"farDatetimeUtc\": \"2019-12-05T11:55Z\"" +
            "}]}"

        // When
        val parsedFARMessage = ERSMapper.getERSMessageValueFromJSON(mapper, farMessage, "FAR", LogbookOperationType.DAT)

        // Then
        assertThat(parsedFARMessage).isInstanceOf(FAR::class.java)
        parsedFARMessage as FAR

        val parsedHauls = parsedFARMessage.hauls
        assertThat(parsedHauls.size).isEqualTo(1)

        val parsedHaul = parsedHauls.first()

        assertThat(parsedHaul.gear).isEqualTo("GTN")
        assertThat(parsedHaul.mesh).isEqualTo(100.0)
        assertThat(parsedHaul.catchDateTime.toString()).isEqualTo("2019-12-05T11:55Z")
        assertThat(parsedHaul.catches).hasSize(14)

        val receivedCatch = parsedHaul.catches.first()
        assertThat(receivedCatch).isNotNull
        assertThat(receivedCatch.statisticalRectangle).isEqualTo("23E6")
        assertThat(receivedCatch.conversionFactor).isEqualTo(1.0)
        assertThat(receivedCatch.effortZone).isEqualTo("C")
        assertThat(receivedCatch.economicZone).isEqualTo("FRA")
        assertThat(receivedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(receivedCatch.species).isEqualTo("SCL")
        assertThat(receivedCatch.weight).isEqualTo(2.0)
    }

    @Test
    fun `getERSMessageValueFromJSON Should deserialize an example RET message`() {
        // Given
        val retMessage = "{\"returnStatus\": \"002\", \"rejectionCause\": \"002 MGEN02 Message incorrect : " +
            "la date/heure de l’événement RTP n° OOF20201105037001 est postérieure à la date/heure courante. " +
            "Veuillez vérifier la date/heure de l’événement déclaré et renvoyer votre message.\"}"

        // When
        val parsedRETMessage = ERSMapper.getERSMessageValueFromJSON(mapper, retMessage, "", LogbookOperationType.RET)

        // Then
        assertThat(parsedRETMessage).isInstanceOf(Acknowledge::class.java)
        parsedRETMessage as Acknowledge

        assertThat(parsedRETMessage.rejectionCause).isNotNull
        assertThat(parsedRETMessage.returnStatus).isEqualTo("002")
    }
}
