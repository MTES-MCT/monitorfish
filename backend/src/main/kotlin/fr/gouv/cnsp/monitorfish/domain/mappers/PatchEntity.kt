package fr.gouv.cnsp.monitorfish.domain.mappers

import fr.gouv.cnsp.monitorfish.config.Patchable
import fr.gouv.cnsp.monitorfish.config.UseCase
import java.util.*
import kotlin.reflect.KMutableProperty
import kotlin.reflect.full.hasAnnotation
import kotlin.reflect.full.memberProperties

@UseCase
class PatchEntity<T : Any, S : Any> {
    /**
     * Patches the target entity with values from the source entity.
     *
     * This function updates the target entity with values from the source entity for properties
     * annotated with @Patchable. If a property in the source entity is null, the existing value
     * in the target entity is retained. If a property in the source entity is an Optional, it
     * is handled accordingly.
     *
     * @param target The target entity to be patched.
     * @param source The source entity providing the patch values.
     */
    fun execute(
        target: T,
        source: S,
    ): T {
        val sourceProperties = source::class.memberProperties
        val targetProperties = target::class.memberProperties

        for (sourceProp in sourceProperties) {
            val targetProp =
                targetProperties.filter { it.hasAnnotation<Patchable>() }.find { it.name == sourceProp.name }
            if (targetProp != null && targetProp is KMutableProperty<*>) {
                val sourceValue = sourceProp.getter.call(source)
                val existingValue = targetProp.getter.call(target)
                val finalValue =
                    if (sourceValue is Optional<*>) {
                        getValueFromOptional(existingValue, sourceValue)
                    } else {
                        sourceValue ?: existingValue
                    }

                try {
                    targetProp.setter.call(target, finalValue)
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("Could not set property '${targetProp.name}'", e)
                }
            }
        }

        return target
    }

    private fun getValueFromOptional(
        existingValue: Any?,
        optional: Optional<*>?,
    ): Any? =
        when {
            /**
             * The property is not passed to the PATCH payload, we keep the existing value
             */
            optional == null -> existingValue
            optional.isPresent -> optional.get()
            /**
             * If the value is set as null in the payload, the value will be Optional.isEmpty.
             * So we set is as null.
             */
            optional.isEmpty -> null
            else -> null
        }
}
