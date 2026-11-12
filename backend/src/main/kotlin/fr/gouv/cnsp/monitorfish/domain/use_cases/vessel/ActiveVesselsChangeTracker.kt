package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselsChanges
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import java.time.Instant
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.UUID

/**
 * Keeps, in memory, when each active vessel last changed, so that a client on a slow connection only downloads
 * the changes since its previous state (`asOf`) instead of all the active vessels.
 *
 * The states are versions of this tracker, prefixed by its id: a state from another backend instance
 * (or before a restart) is not trusted, and all the vessels are returned.
 */
@UseCase
class ActiveVesselsChangeTracker {
    private val trackerId = UUID.randomUUID().toString().substringBefore("-")

    @Volatile
    private var state: State? = null

    private data class TrackedVessel(
        val vessel: EnrichedActiveVessel,
        val changedAtVersion: Long,
        val notOnlyPositionChangedAtVersion: Long,
    )

    private data class State(
        val recordedVessels: List<EnrichedActiveVessel>,
        val version: Long,
        val vessels: Map<String, TrackedVessel>,
        val removedAtVersionByFeatureId: Map<String, Long>,
        val fingerprint: Long,
    )

    val currentVessels: List<EnrichedActiveVessel>
        get() = state?.vessels?.values?.map { it.vessel } ?: listOf()

    /**
     * The same list instance (i.e. not refreshed by the shared cache) is ignored.
     */
    @Synchronized
    fun record(activeVessels: List<EnrichedActiveVessel>) {
        val previousState = state
        if (previousState != null && previousState.recordedVessels === activeVessels) {
            return
        }

        val version = maxOf(System.currentTimeMillis(), (previousState?.version ?: 0) + 1)
        val previousVessels = previousState?.vessels ?: mapOf()

        val vessels = LinkedHashMap<String, TrackedVessel>()
        activeVessels.forEach { vessel ->
            val featureId = vessel.getFeatureId()
            val previous = previousVessels[featureId]

            vessels[featureId] =
                when {
                    previous == null -> TrackedVessel(vessel, version, version)
                    previous.vessel == vessel -> previous
                    withoutPosition(previous.vessel) == withoutPosition(vessel) ->
                        TrackedVessel(vessel, version, previous.notOnlyPositionChangedAtVersion)
                    else -> TrackedVessel(vessel, version, version)
                }
        }

        val removedAtVersionByFeatureId =
            (previousState?.removedAtVersionByFeatureId ?: mapOf())
                .filter { (featureId, removedAt) ->
                    featureId !in vessels && version - removedAt <= REMOVED_VESSELS_RETENTION_MS
                } +
                previousVessels.keys.filter { it !in vessels }.associateWith { version }

        state =
            State(
                recordedVessels = activeVessels,
                version = version,
                vessels = vessels,
                removedAtVersionByFeatureId = removedAtVersionByFeatureId,
                fingerprint = getFingerprint(vessels.keys),
            )
    }

    fun getChangesSince(after: String?): ActiveVesselsChanges {
        val currentState = requireNotNull(state) { "No active vessels recorded." }
        val asOf = "$trackerId.${currentState.version}"
        val afterVersion = parseVersion(after)

        val isFull = afterVersion == null || currentState.version - afterVersion > REMOVED_VESSELS_RETENTION_MS
        if (isFull) {
            return ActiveVesselsChanges(
                asOf = asOf,
                isFull = true,
                vessels = currentState.vessels.values.map { it.vessel },
                positions = listOf(),
                removedVesselFeatureIds = listOf(),
                activeVesselsCount = currentState.vessels.size,
                fingerprint = currentState.fingerprint,
            )
        }

        val changedVessels = currentState.vessels.values.filter { it.changedAtVersion > afterVersion }

        return ActiveVesselsChanges(
            asOf = asOf,
            isFull = false,
            vessels = changedVessels.filter { it.notOnlyPositionChangedAtVersion > afterVersion }.map { it.vessel },
            positions = changedVessels.filter { it.notOnlyPositionChangedAtVersion <= afterVersion }.map { it.vessel },
            removedVesselFeatureIds =
                currentState.removedAtVersionByFeatureId
                    .filterValues { it > afterVersion }
                    .keys
                    .toList(),
            activeVesselsCount = currentState.vessels.size,
            fingerprint = currentState.fingerprint,
        )
    }

    private fun parseVersion(after: String?): Long? {
        val parts = after?.split(".") ?: return null
        if (parts.size != 2 || parts[0] != trackerId) {
            return null
        }

        return parts[1].toLongOrNull()
    }

    companion object {
        /** States older than that are answered with all the vessels (the removed vessels are not kept longer) */
        private const val REMOVED_VESSELS_RETENTION_MS = 24 * 60 * 60 * 1000L

        private val POSITION_PLACEHOLDER_DATE_TIME = ZonedDateTime.ofInstant(Instant.EPOCH, ZoneOffset.UTC)

        /** The vessel without the properties sent by a position change (see `ActiveVesselPositionDataOutput`) */
        private fun withoutPosition(vessel: EnrichedActiveVessel): EnrichedActiveVessel =
            vessel.copy(
                lastPosition =
                    vessel.lastPosition?.copy(
                        positionType = PositionType.VMS,
                        latitude = 0.0,
                        longitude = 0.0,
                        estimatedCurrentLatitude = null,
                        estimatedCurrentLongitude = null,
                        speed = null,
                        course = null,
                        dateTime = POSITION_PLACEHOLDER_DATE_TIME,
                        emissionPeriod = null,
                        isAtPort = false,
                    ),
            )

        /**
         * FNV-1a (32 bits) of the sorted feature ids joined by line breaks.
         * See in frontend: `getActiveVesselsFingerprint()`.
         */
        fun getFingerprint(featureIds: Collection<String>): Long {
            var hash = 0x811c9dc5.toInt()
            featureIds.sorted().joinToString("\n").forEach { char ->
                hash = (hash xor char.code) * 0x01000193
            }

            return hash.toLong() and 0xffffffffL
        }
    }
}
