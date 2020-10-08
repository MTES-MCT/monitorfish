package fr.gouv.cnsp.monitorfish.infrastructure.api.inputs

import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

internal class NAFPositionDataInputUTests {
    @Test
    internal fun `init should parse this example NAF message`() {
        // Given
        val naf = "//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER"

        // When
        val position = NAFPositionDataInput(naf).toPosition()

        // Then
        assertThat(position.internalReferenceNumber).isEqualTo("GBROOC21250")
        assertThat(position.IRCS).isEqualTo("MGXR6")
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
        val naf = "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//IR/NLD201901153//DA/20201006//TI/2126//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER"

        // When
        val position = NAFPositionDataInput(naf).toPosition()

        // Then
        assertThat(position.vesselName).isEqualTo("GENGI")
        assertThat(position.internalReferenceNumber).isEqualTo("NLD201901153")
        assertThat(position.IRCS).isEqualTo("PCVC")
        assertThat(position.dateTime).isEqualTo(ZonedDateTime.parse("2020-10-06T21:26Z"))
        assertThat(position.course).isEqualTo(173.0)
        assertThat(position.from).isEqualTo(CountryCode.NL)
        assertThat(position.destination).isEqualTo(CountryCode.FR)
        assertThat(position.flagState).isEqualTo(CountryCode.NL)
        assertThat(position.speed).isEqualTo(0.0)
        assertThat(position.longitude).isEqualTo(4.269)
        assertThat(position.latitude).isEqualTo(52.099)

        assertThat(position.tripNumber).isNull()
        assertThat(position.externalReferenceNumber).isNull()
    }

    @Test
    internal fun `init should throw an exception When invalid message type`() {
        // Given
        val naf = "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//IR/NLD201901153//DA/20201006//TI/2126//LT/52.099//LG/4.269//SP/0//CO/173//TM/ACK//ER"

        // When
        val throwable = catchThrowable { NAFPositionDataInput(naf) }

        // Then
        assertThat(throwable.message).contains("Unhandled message type")
    }

    @Test
    internal fun `init should throw an exception When no date or time`() {
        // Given
        val naf = "//SR//AD/FRA//FR/NLD//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//IR/NLD201901153//DA/20201006//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER"

        // When
        val throwable = catchThrowable { NAFPositionDataInput(naf) }

        // Then
        assertThat(throwable.message).contains("No date or time")
    }

    @Test
    internal fun `init should throw an exception When bad from country three letters found`() {
        // Given
        val naf = "//SR//AD/FRA//FR/LOL//RD/20201006//NA/GENGI//RT/2133//FS/NLD//RC/PCVC//XR/SCH43//TI/1025//IR/NLD201901153//DA/20201006//LT/52.099//LG/4.269//SP/0//CO/173//TM/POS//ER"

        // When
        val throwable = catchThrowable { NAFPositionDataInput(naf) }

        // Then
        assertThat(throwable.message).contains("Country \"LOL\" not found")
    }
}