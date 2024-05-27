package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters

import com.neovisionaries.i18n.CountryCode
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class CountryCodeConverter : AttributeConverter<CountryCode?, String?> {
    override fun convertToDatabaseColumn(attribute: CountryCode?): String? {
        return attribute?.name
    }

    override fun convertToEntityAttribute(dbData: String?): CountryCode? {
        if (dbData == null) {
            return CountryCode.UNDEFINED
        }

        return try {
            CountryCode.valueOf(dbData)
        } catch (e: Throwable) {
            return CountryCode.UNDEFINED
        }
    }
}
