package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils

/**
 * Domain enums and their `contract` counterparts share constant names: the parity is checked by `ContractEnumMapperUTests`.
 */
inline fun <reified T : Enum<T>> Enum<*>.toContract(): T = enumValueOf(name)
