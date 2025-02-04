package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.mappers.ERSMapper.JSONB_NULL_STRING

fun <T> deserializeJSONList(
    mapper: ObjectMapper,
    json: String?,
    clazz: Class<T>,
): List<T> =
    json?.let {
        if (it == JSONB_NULL_STRING) {
            return listOf()
        }

        mapper.readValue(
            it,
            mapper.typeFactory
                .constructCollectionType(MutableList::class.java, clazz),
        )
    } ?: listOf()
