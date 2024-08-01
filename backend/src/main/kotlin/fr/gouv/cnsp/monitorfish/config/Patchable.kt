package fr.gouv.cnsp.monitorfish.config

/**
 * Warning: All properties patched MUST be declared as `var`, and not `val`
 */
@Target(AnnotationTarget.PROPERTY)
@Retention(AnnotationRetention.RUNTIME)
annotation class Patchable
