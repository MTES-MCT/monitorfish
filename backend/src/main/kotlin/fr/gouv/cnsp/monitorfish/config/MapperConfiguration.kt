package fr.gouv.cnsp.monitorfish.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategy
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.jsontype.NamedType
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.IHasImplementation as IRulesHasImplementation
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.IHasImplementation as IAlertsHasImplementation
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import java.util.*

@Configuration
class MapperConfiguration {
    @Bean
    fun objectMapper(): ObjectMapper {
        val mapper = Jackson2ObjectMapperBuilder().build<ObjectMapper>()

        // needed to handle java.time.ZonedDateTime serialization
        mapper.registerModule(JavaTimeModule())
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        mapper.propertyNamingStrategy = PropertyNamingStrategy.LOWER_CAMEL_CASE

        mapper.registerSubtypes(NamedType(Catch::class.java, "catch"))
        mapper.registerSubtypes(NamedType(Gear::class.java, "gear"))

        registerRulesSubType(mapper, RuleTypeMapping::class.java)
        registerAlertsSubType(mapper, AlertTypeMapping::class.java)

        return mapper
    }

    private fun <E> registerRulesSubType(mapper: ObjectMapper, enumOfTypeToAdd: Class<E>) where E : Enum<E>?, E : IRulesHasImplementation? {
        Arrays.stream(enumOfTypeToAdd.enumConstants)
                .map { enumItem -> NamedType(enumItem.getImplementation(), enumItem.name) }
                .forEach { type -> mapper.registerSubtypes(type) }
    }

    private fun <E> registerAlertsSubType(mapper: ObjectMapper, enumOfTypeToAdd: Class<E>) where E : Enum<E>?, E : IAlertsHasImplementation? {
        Arrays.stream(enumOfTypeToAdd.enumConstants)
                .map { enumItem -> NamedType(enumItem.getImplementation(), enumItem.name) }
                .forEach { type -> mapper.registerSubtypes(type) }
    }
}
