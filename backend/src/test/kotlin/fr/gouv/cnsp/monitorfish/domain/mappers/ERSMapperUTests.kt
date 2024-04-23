package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.CPS
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import
import java.time.ZonedDateTime

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
    fun `getERSMessageValueFromJSON Should deserialize a FAR message When it is first serialized`() {
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
        assertThat(parsedRETMessage).isInstanceOf(Acknowledgment::class.java)
        parsedRETMessage as Acknowledgment

        assertThat(parsedRETMessage.rejectionCause).isNotNull
        assertThat(parsedRETMessage.returnStatus).isEqualTo("002")
    }

    @Test
    fun `getERSMessageValueFromJSON Should deserialize an example DEP message`() {
        // Given
        val depMessage =
            "{\"gearOnboard\": [{\"gear\": \"GTR\", \"mesh\": 100.0}], \"departurePort\": \"AEJAZ\", \"anticipatedActivity\": \"FSH\", \"tripStartDate\": \"2018-02-17T00:00Z\", \"departureDatetimeUtc\": \"2018-02-17T01:05Z\"}"

        // When
        val parsedDEPMessage = ERSMapper.getERSMessageValueFromJSON(mapper, depMessage, "DEP", LogbookOperationType.DAT)

        // Then
        assertThat(parsedDEPMessage).isInstanceOf(DEP::class.java)
        parsedDEPMessage as DEP

        assertThat(parsedDEPMessage.tripStartDate).isNotNull
        assertThat(parsedDEPMessage.departureDateTime).isNotNull
    }

    @Test
    fun `getERSMessageValueFromJSON Should deserialize a CPS message When it is first serialized`() {
        // Given
        val catch = ProtectedSpeciesCatch()
        catch.economicZone = "FRA"
        catch.effortZone = "C"
        catch.faoZone = "27.8.a"
        catch.statisticalRectangle = "23E6"
        catch.species = "SCR"
        catch.weight = 125.0
        catch.healthState = HealthState.DEA

        val cpsMessage = CPS()
        cpsMessage.catches = listOf(catch)
        cpsMessage.gear = "OTB"
        cpsMessage.mesh = 80.0
        cpsMessage.latitude = 45.389
        cpsMessage.longitude = -1.303
        cpsMessage.cpsDatetime = ZonedDateTime.now()

        // When
        val jsonString = mapper.writeValueAsString(cpsMessage)
        val parsedCPSMessage = ERSMapper.getERSMessageValueFromJSON(mapper, jsonString, "CPS", LogbookOperationType.DAT)

        // Then
        assertThat(parsedCPSMessage).isInstanceOf(CPS::class.java)
        parsedCPSMessage as CPS

        assertThat(parsedCPSMessage.gear).isEqualTo("OTB")
        assertThat(parsedCPSMessage.mesh).isEqualTo(80.0)
        assertThat(parsedCPSMessage.latitude).isEqualTo(45.389)
        assertThat(parsedCPSMessage.longitude).isEqualTo(-1.303)

        val parsedCatches = parsedCPSMessage.catches
        assertThat(parsedCatches.size).isEqualTo(1)

        val parsedCatch = parsedCatches.first()
        assertThat(parsedCatch).isNotNull
        assertThat(parsedCatch.statisticalRectangle).isEqualTo("23E6")
        assertThat(parsedCatch.economicZone).isEqualTo("FRA")
        assertThat(parsedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(parsedCatch.species).isEqualTo("SCR")
        assertThat(parsedCatch.weight).isEqualTo(125.0)
    }

    @Test
    fun `second getERSMessageValueFromJSON Should deserialize an example CPS message`() {
        // Given
        val cpsMessage = "{" +
            "\"cpsDatetimeUtc\": \"2023-02-28T17:44:00Z\"," +
            "\"gear\": \"GTR\"," +
            "\"mesh\": 100.0," +
            "\"dimensions\": \"50.0;2.0\"," +
            "\"catches\": [" +
            "{" +
            "\"sex\": \"M\"," +
            "\"healthState\": \"DEA\"," +
            "\"careMinutes\": null," +
            "\"ring\": \"1234567\"," +
            "\"fate\": \"DIS\"," +
            "\"comment\": null," +
            "\"species\": \"DCO\"," +
            "\"weight\": 60.0," +
            "\"nbFish\": 1.0," +
            "\"faoZone\": \"27.8.a\"," +
            "\"economicZone\": \"FRA\"," +
            "\"statisticalRectangle\": \"22E7\"," +
            "\"effortZone\": \"C\"" +
            "}," +
            "{" +
            "\"sex\": \"M\"," +
            "\"healthState\": \"DEA\"," +
            "\"careMinutes\": 40," +
            "\"ring\": \"1234568\"," +
            "\"fate\": \"DIS\"," +
            "\"comment\": \"Pov' titi a eu bobo\"," +
            "\"species\": \"DCO\"," +
            "\"weight\": 80.0," +
            "\"nbFish\": 1.0," +
            "\"faoZone\": \"27.8.a\"," +
            "\"economicZone\": \"FRA\"," +
            "\"statisticalRectangle\": \"22E7\"," +
            "\"effortZone\": \"C\"" +
            "}" +
            "]," +
            "\"latitude\": 46.575," +
            "\"longitude\": -2.741" +
            "}"

        // When
        val parsedCPSMessage = ERSMapper.getERSMessageValueFromJSON(mapper, cpsMessage, "CPS", LogbookOperationType.DAT)

        // Then
        assertThat(parsedCPSMessage).isInstanceOf(CPS::class.java)
        parsedCPSMessage as CPS

        assertThat(parsedCPSMessage.cpsDatetime).isNotNull()
        assertThat(parsedCPSMessage.gear).isEqualTo("GTR")
        assertThat(parsedCPSMessage.mesh).isEqualTo(100.0)
        assertThat(parsedCPSMessage.latitude).isEqualTo(46.575)
        assertThat(parsedCPSMessage.longitude).isEqualTo(-2.741)

        val parsedCatches = parsedCPSMessage.catches
        assertThat(parsedCatches.size).isEqualTo(2)

        val parsedCatch = parsedCatches.first()
        assertThat(parsedCatch).isNotNull
        assertThat(parsedCatch.sex).isEqualTo("M")
        assertThat(parsedCatch.healthState).isEqualTo(HealthState.DEA)
        assertThat(parsedCatch.careMinutes).isNull()
        assertThat(parsedCatch.ring).isEqualTo(1234567)
        assertThat(parsedCatch.comment).isNull()
        assertThat(parsedCatch.species).isEqualTo("DCO")
        assertThat(parsedCatch.weight).isEqualTo(60.0)
        assertThat(parsedCatch.nbFish).isEqualTo(1.0)
        assertThat(parsedCatch.faoZone).isEqualTo("27.8.a")
        assertThat(parsedCatch.economicZone).isEqualTo("FRA")
        assertThat(parsedCatch.statisticalRectangle).isEqualTo("22E7")
        assertThat(parsedCatch.effortZone).isEqualTo("C")
    }
}
