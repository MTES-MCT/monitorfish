package fr.gouv.cnsp.monitorfish.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.core.convert.TypeDescriptor

class SessionConfigUTests {
    private val conversionService = SessionConfig().springSessionConversionService()
    private val bytesType = TypeDescriptor.valueOf(ByteArray::class.java)
    private val objectType = TypeDescriptor.valueOf(Any::class.java)

    @Test
    fun `springSessionConversionService Should serialize and deserialize a session attribute`() {
        // Given
        val attribute = linkedMapOf("email" to "user@example.com")

        // When
        val bytes = conversionService.convert(attribute, objectType, bytesType) as ByteArray
        val deserializedAttribute = conversionService.convert(bytes, bytesType, objectType)

        // Then
        assertThat(deserializedAttribute).isEqualTo(attribute)
    }

    @Test
    fun `springSessionConversionService Should return null When a session attribute can not be deserialized`() {
        // Given
        val bytes = "not a serialized object".toByteArray()

        // When
        val deserializedAttribute = conversionService.convert(bytes, bytesType, objectType)

        // Then
        assertThat(deserializedAttribute).isNull()
    }
}
