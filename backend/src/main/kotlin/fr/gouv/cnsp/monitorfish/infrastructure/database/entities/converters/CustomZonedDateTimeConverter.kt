package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters

import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.sql.Timestamp
import java.time.ZoneOffset

@Converter(autoApply = true)
class CustomZonedDateTimeConverter : AttributeConverter<CustomZonedDateTime, Timestamp> {
    override fun convertToDatabaseColumn(attribute: CustomZonedDateTime?): Timestamp? =
        attribute?.toZonedDateTime()?.let { Timestamp.valueOf(it.toLocalDateTime()) }

    override fun convertToEntityAttribute(dbData: Timestamp?): CustomZonedDateTime? =
        dbData?.toLocalDateTime()?.atZone(ZoneOffset.UTC)?.let {
            CustomZonedDateTime.fromZonedDateTime(it)
        }
}
