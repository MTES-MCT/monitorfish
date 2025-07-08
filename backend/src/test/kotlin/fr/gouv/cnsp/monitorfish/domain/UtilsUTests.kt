package fr.gouv.cnsp.monitorfish.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UtilsUTests {
    @Test
    fun `extractNameAndAddressFromERS Should return the name and address When given`() {
        // Given
        val xml =
            """
            <ers:OPS xmlns:ers="ers">
              <ers:DAT TM="CU">
                <ers:ERS RN="OOF20250706045115" RD="2025-07-06" RT="12:56">
                  <ers:LOG IR="FRA000123456" RC="" XR="" NA="LE NAVIRE"
                           MA="UN NOM" MD="ADRESSE - 56410 ETEL" FS="FRA">
                  </ers:LOG>
                </ers:ERS>
              </ers:DAT>
            </ers:OPS>
            """.trimIndent()

        // When
        val nameAndAddress = extractBossNameAndAddressFromERS(xml)

        // Then
        assertThat(nameAndAddress?.first).isEqualTo("UN NOM")
        assertThat(nameAndAddress?.second).isEqualTo("ADRESSE - 56410 ETEL")
    }

    @Test
    fun `extractNameAndAddressFromERS Should return the name and address When another given`() {
        // Given
        val xml =
            """
            <?xml version="1.0" encoding="UTF-8" standalone="yes"?><ers:OPS xmlns:ers="http://ec.europa.eu/fisheries/schema/ers/v3" AD="FRA" FR="OOF" ON="OOF20250704017200" OD="2025-07-04" OT="21:44" EVL="IKTUS 4.6.7"><ers:DAT TM="CU"><ers:ERS RN="OOF20250704017200" RD="2025-07-04" RT="21:44"><ers:LOG IR="XXX" RC="" XR="" NA="VESSEL NAME" MA="Jean Bon" MD="56, rue du Croisic, 44100, Nantes" FS="FRA"><ers:DEP DA="2025-07-04" TI="21:44" PO="FROII" AA="FSH"><ers:GEA GE="OTT" ME="80" GC="17.0;0.0"/></ers:DEP><ers:ELOG Type="nat" CH="FRA" TN="20250055"/></ers:LOG></ers:ERS></ers:DAT></ers:OPS>
            """.trimIndent()

        // When
        val nameAndAddress = extractBossNameAndAddressFromERS(xml)

        // Then
        assertThat(nameAndAddress?.first).isEqualTo("Jean Bon")
        assertThat(nameAndAddress?.second).isEqualTo("56, rue du Croisic, 44100, Nantes")
    }

    @Test
    fun `extractNameAndAddressFromERS Should return null When no xmlns namespace is included in the message`() {
        // Given
        val xml =
            """
            <ers:OPS>
              <ers:DAT TM="CU">
                <ers:ERS RN="OOF20250706045115" RD="2025-07-06" RT="12:56">
                  <ers:LOG IR="FRA000123456" RC="" XR="" NA="LE NAVIRE"
                           MA="UN NOM" MD="ADRESSE - 56410 ETEL" FS="FRA">
                  </ers:LOG>
                </ers:ERS>
              </ers:DAT>
            </ers:OPS>
            """.trimIndent()

        // When
        val nameAndAddress = extractBossNameAndAddressFromERS(xml)

        // Then
        assertThat(nameAndAddress).isNull()
    }

    @Test
    fun `extractNameAndAddressFromERS Should return null When no XML`() {
        // When
        val nameAndAddress = extractBossNameAndAddressFromERS(null)

        // Then
        assertThat(nameAndAddress).isNull()
    }

    @Test
    fun `extractNameAndAddressFromERS Should return null When empty XML`() {
        // When
        val nameAndAddress = extractBossNameAndAddressFromERS("")

        // Then
        assertThat(nameAndAddress).isNull()
    }

    @Test
    fun `extractNameAndAddressFromERS Should return null When no tag founds in XML`() {
        // Given
        val xml =
            """
            <ers:OPS xmlns:ers="ers">
              <ers:DAT TM="CU">
                <ers:ERS RN="OOF20250706045115" RD="2025-07-06" RT="12:56">
                  <ers:LOG IR="FRA000123456" RC="" XR="" NA="LE NAVIRE"
                           FS="FRA">
                  </ers:LOG>
                </ers:ERS>
              </ers:DAT>
            </ers:OPS>
            """.trimIndent()

        // When
        val nameAndAddress = extractBossNameAndAddressFromERS(xml)

        // Then
        assertThat(nameAndAddress?.first).isEqualTo("")
        assertThat(nameAndAddress?.second).isEqualTo("")
    }
}
