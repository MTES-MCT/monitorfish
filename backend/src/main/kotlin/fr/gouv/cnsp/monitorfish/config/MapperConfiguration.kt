package fr.gouv.cnsp.monitorfish.config

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.jsontype.NamedType
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.ProtectedSpeciesCatch
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingTypeMapping
import org.n52.jackson.datatype.jts.JtsModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear as GearLogbook
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.IHasImplementation as IReportingsHasImplementation

@Configuration
class MapperConfiguration {
    @Bean
    fun objectMapper(): ObjectMapper {
        val mapper = Jackson2ObjectMapperBuilder().build<ObjectMapper>()

        mapper.registerModule(JtsModule())
        mapper.registerModule(
            SimpleModule().apply {
                addSerializer(Double::class.java, RoundedDoubleSerializer())
                addSerializer(Double::class.javaPrimitiveType, RoundedDoubleSerializer())
                addSerializer(BigDecimal::class.java, RoundedBigDecimalSerializer())
                addDeserializer(AlertType::class.java, AlertTypeMappingDeserializer())
            },
        )

        // needed to handle java.time.ZonedDateTime serialization
        mapper.registerModule(JavaTimeModule())
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        mapper.propertyNamingStrategy = PropertyNamingStrategies.LOWER_CAMEL_CASE

        mapper.registerSubtypes(NamedType(LogbookFishingCatch::class.java, "catch"))
        mapper.registerSubtypes(NamedType(ProtectedSpeciesCatch::class.java, "protectedSpeciesCatch"))
        mapper.registerSubtypes(NamedType(GearLogbook::class.java, "gear"))

        registerReportingsSubType(mapper, ReportingTypeMapping::class.java)

        return mapper
    }

    private fun <E> registerReportingsSubType(
        mapper: ObjectMapper,
        enumOfTypeToAdd: Class<E>,
    ) where E : Enum<E>?, E : IReportingsHasImplementation? {
        Arrays
            .stream(enumOfTypeToAdd.enumConstants)
            .map { enumItem -> NamedType(enumItem.getImplementation(), enumItem.name) }
            .forEach { type -> mapper.registerSubtypes(type) }
    }
}

class RoundedDoubleSerializer : JsonSerializer<Double>() {
    override fun serialize(
        value: Double,
        gen: JsonGenerator,
        serializers: SerializerProvider,
    ) {
        val rounded =
            BigDecimal(value)
                .setScale(4, RoundingMode.HALF_UP)
                .toDouble()

        gen.writeNumber(rounded)
    }
}

class RoundedBigDecimalSerializer : JsonSerializer<BigDecimal>() {
    override fun serialize(
        value: BigDecimal,
        gen: JsonGenerator,
        serializers: SerializerProvider,
    ) {
        val rounded = value.setScale(4, RoundingMode.HALF_UP)
        gen.writeNumber(rounded)
    }
}

class AlertTypeMappingDeserializer : JsonDeserializer<AlertType>() {
    override fun deserialize(
        p: JsonParser,
        ctxt: DeserializationContext,
    ): AlertType {
        val value = p.text
        return AlertType.valueOf(value)
    }
}
