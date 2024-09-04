package fr.gouv.cnsp.monitorfish.domain.mappers

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.NetworkType
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

internal class NAFMessageMapperUTests {
    @Test
    internal fun `init should parse this example NAF message`() {
        // Given
        val naf =
            "//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//" +
                "DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        // Then
        assertThat(position.internalReferenceNumber).isEqualTo("GBROOC21250")
        assertThat(position.ircs).isEqualTo("MGXR6")
        assertThat(position.dateTime).isEqualTo(ZonedDateTime.parse("2020-10-06T16:25Z"))
        assertThat(position.course).isEqualTo(8.0)
        assertThat(position.from).isEqualTo(CountryCode.GB)
        assertThat(position.destination).isEqualTo(CountryCode.FR)
        assertThat(position.flagState).isEqualTo(CountryCode.GB)
        assertThat(position.speed).isEqualTo(9.6)
        assertThat(position.longitude).isEqualTo(0.94)
        assertThat(position.latitude).isEqualTo(53.254)

        assertThat(position.tripNumber).isNull()
        assertThat(position.externalReferenceNumber).isNull()
        assertThat(position.vesselName).isNull()
    }

    @Test
    internal fun `init should parse this other example NAF message`() {
        // Given
        val naf =
            "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//" +
                "IR/NLD201901153//DA/20201006//TI/2126//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        // Then
        assertThat(position.vesselName).isEqualTo("GENGI")
        assertThat(position.internalReferenceNumber).isEqualTo("NLD201901153")
        assertThat(position.ircs).isEqualTo("PCVC")
        assertThat(position.dateTime).isEqualTo(ZonedDateTime.parse("2020-10-06T21:26Z"))
        assertThat(position.course).isEqualTo(173.0)
        assertThat(position.from).isEqualTo(CountryCode.NL)
        assertThat(position.destination).isEqualTo(CountryCode.FR)
        assertThat(position.flagState).isEqualTo(CountryCode.NL)
        assertThat(position.speed).isEqualTo(0.0)
        assertThat(position.longitude).isEqualTo(4.269)
        assertThat(position.latitude).isEqualTo(52.099)
        assertThat(position.externalReferenceNumber).isEqualTo("SCH43")

        assertThat(position.tripNumber).isNull()
    }

    @Test
    internal fun `init should parse this another example NAF message`() {
        // Given
        val naf =
            "//SR//FR/SWE//TM/POS//RC/F1007//IR/SWE0000F1007//XR/EXT3//LT/57.037//LG/12.214//" +
                "SP/50//CO/190//DA/20170817//TI/0500//NA/Ship1007//FS/SWE//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        // Then
        assertThat(position.vesselName).isEqualTo("Ship1007")
        assertThat(position.internalReferenceNumber).isEqualTo("SWE0000F1007")
        assertThat(position.ircs).isEqualTo("F1007")
        assertThat(position.dateTime).isEqualTo(ZonedDateTime.parse("2017-08-17T05:00Z"))
        assertThat(position.course).isEqualTo(190.0)
        assertThat(position.from).isEqualTo(CountryCode.SE)
        assertThat(position.flagState).isEqualTo(CountryCode.SE)
        assertThat(position.speed).isEqualTo(5.0)
        assertThat(position.longitude).isEqualTo(12.214)
        assertThat(position.latitude).isEqualTo(57.037)
        assertThat(position.externalReferenceNumber).isEqualTo("EXT3")

        assertThat(position.tripNumber).isNull()
        assertThat(position.destination).isNull()
    }

    @Test
    internal fun `init should throw an exception When invalid message type`() {
        // Given
        val naf =
            "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//" +
                "IR/NLD201901153//DA/20201006//TI/2126//LT/52.099//LG/4.269//SP/0//CO/173//TM/ACK//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable.message).contains("Unhandled message type")
    }

    @Test
    internal fun `init Should throw an exception When no date or time`() {
        // Given
        val naf =
            "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//" +
                "IR/NLD201901153//DA/20201006//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable.message).contains("No date or time")
    }

    @Test
    internal fun `init Should throw an exception When bad from country three letters found`() {
        // Given
        val naf =
            "//SR//AD/FRA//FR/LOL//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//" +
                "TI/1025//IR/NLD201901153//DA/20201006//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable.message).contains("Country \"LOL\" not found")
    }

    @Test
    internal fun `init Should parse invalid start record`() {
        val naf =
            "//FR/SWE//AD/UVM//TM/POS//IR/SWE0000F1007//LT/57.037//LG/12.214//" +
                "SP/50//CO/190//DA/20170817//TI/0500//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable.message).contains("Invalid NAF format")
    }

    @Test
    internal fun `init Should parse invalid latitude`() {
        val naf =
            "//SR//FR/SWE//TM/POS//IR/SWE0000F1007//LT/LOL//LG/12.214//" +
                "SP/50//CO/190//DA/20170817//TI/0500//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable.message).contains("Incorrect value at field LATITUDE_DECIMAL")
    }

    @Test
    internal fun `init Should skip an empty field`() {
        val naf =
            "//SR//FR/SWE//TM/POS//IR/SWE0000F1007//LT///LG/12.214//" +
                "SP/50//CO/190//DA/20170817//TI/0500//ER//"

        // When
        val throwable = catchThrowable { NAFMessageMapper(naf) }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    internal fun `init Should not throw an exception When no course`() {
        // Given
        val naf =
            "//SR//FR/SWE//TM/POS//RC/F1007//IR/SWE0000F1007//XR/EXT3//LT/57.037//LG/12.214" +
                "//SP/0//DA/20170817//TI/0500//NA/Ship1007//FS/SWE//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        assertThat(position.course).isNull()
    }

    @Test
    internal fun `init Should not throw an exception When the message type is manual`() {
        // Given
        val naf = "//SR//TM/MAN//IR/ESP000022941//NA/PLAYA DE TUYA//RC/FIUW//FS/FRA//XR/BA932998//DA/20210602//TI/2330//LT/+53.267//LG/-011.733//FR/FRA//RD/20210603//RT/0551//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        assertThat(position.internalReferenceNumber).isEqualTo("ESP000022941")
    }

    @Test
    internal fun `init Should not throw an exception When the country is not found`() {
        // Given
        val naf = "//SR//TM/POS//NA/LADY CHRIS 7//RC/FLBO//FS/X//DA/20210929//TI/1234//LT/-13.477//LG/-141.731//SP/020//CO/221//FR/FRA//RD/20210929//RT/1234//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        assertThat(position.vesselName).isEqualTo("LADY CHRIS 7")
    }

    @Test
    internal fun `init Should set the speed and course as null When not specified in the NAF message`() {
        // Given
        val naf = "//SR//TM/POS//NA/LADY CHRIS 7//RC/FLBO//FS/X//DA/20210929//TI/1234//LT/-13.477//LG/-141.731//FR/FRA//RD/20210929//RT/1234//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        assertThat(position.speed).isNull()
        assertThat(position.course).isNull()
    }

    @Test
    internal fun `init Should parse the network type When given`() {
        // Given
        val naf = "//SR//TM/POS//IR/FRA000123456//NA/MANUEL//RC/FT6951//FS/FRA//XR/TL326095//DA/20200814//TI/0911//LT/+43.0789//LG/+006.1549//SP/000//CO/0//FR/FRA//RD/20200814//RT/0912//MS/SAT//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        // Then
        assertThat(position.networkType).isEqualTo(NetworkType.SATELLITE)
    }

    @Test
    internal fun `init Should not throw When the network type is incorrect`() {
        // Given
        val naf = "//SR//TM/POS//IR/FRA000123456//NA/MANUEL//RC/FT6951//FS/FRA//XR/TL326095//DA/20200814//TI/0911//LT/+43.0789//LG/+006.1549//SP/000//CO/0//FR/FRA//RD/20200814//RT/0912//MS/INCORRECT//ER//"

        // When
        val position = NAFMessageMapper(naf).toPosition()

        // Then
        assertThat(position.networkType).isNull()
    }
}
