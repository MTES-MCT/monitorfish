package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.rules.InputSource
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import

@Import(MapperConfiguration::class)
@JsonTest
class RuleMapperUTests {

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `getRuleTypeFromJSON Should deserialize PNOAndLANWeightTolerance When it is first serialized`() {
        // Given
        val pnoAndLANWeightTolerance = PNOAndLANWeightTolerance(10.0)

        // When
        val jsonString = mapper.writeValueAsString(pnoAndLANWeightTolerance)
        val parsedPNOAndLANWeightTolerance = RuleMapper.getRuleTypeFromJSON(mapper, jsonString)

        // Then
        assertThat(parsedPNOAndLANWeightTolerance).isInstanceOf(PNOAndLANWeightTolerance::class.java)
        parsedPNOAndLANWeightTolerance as PNOAndLANWeightTolerance

        assertThat(parsedPNOAndLANWeightTolerance.percentOfTolerance).isEqualTo(10.0)
        assertThat(parsedPNOAndLANWeightTolerance.name).isEqualTo(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE)
        assertThat(parsedPNOAndLANWeightTolerance.inputSource).isEqualTo(InputSource.Logbook)
    }
}
