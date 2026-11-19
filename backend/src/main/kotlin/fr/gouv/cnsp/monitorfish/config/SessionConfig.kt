package fr.gouv.cnsp.monitorfish.config

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.ConversionService
import org.springframework.core.convert.TypeDescriptor
import org.springframework.core.convert.converter.GenericConverter
import org.springframework.core.convert.converter.GenericConverter.ConvertiblePair
import org.springframework.core.convert.support.GenericConversionService
import org.springframework.core.serializer.support.DeserializingConverter
import org.springframework.core.serializer.support.SerializationFailedException
import org.springframework.core.serializer.support.SerializingConverter

/**
 * HTTP sessions are stored in the database (Spring Session JDBC) to survive the backend restarts.
 */
@Configuration
class SessionConfig {
    private val logger = LoggerFactory.getLogger(SessionConfig::class.java)

    /**
     * A session attribute serialized by a previous version of a dependency (i.e. Spring Security) may not be
     * deserializable anymore: it is dropped, so that the user is asked to log in again instead of getting errors.
     */
    @Bean("springSessionConversionService")
    fun springSessionConversionService(): ConversionService {
        val deserializingConverter = DeserializingConverter(SessionConfig::class.java.classLoader)

        return GenericConversionService().apply {
            addConverter(Any::class.java, ByteArray::class.java, SerializingConverter())
            addConverter(
                object : GenericConverter {
                    override fun getConvertibleTypes() = setOf(ConvertiblePair(ByteArray::class.java, Any::class.java))

                    override fun convert(
                        source: Any?,
                        sourceType: TypeDescriptor,
                        targetType: TypeDescriptor,
                    ): Any? =
                        try {
                            deserializingConverter.convert(source as ByteArray)
                        } catch (e: SerializationFailedException) {
                            logger.warn("Dropping a session attribute that could not be deserialized.", e)

                            null
                        }
                },
            )
        }
    }
}
