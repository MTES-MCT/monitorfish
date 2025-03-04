package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselPositions(
    private val positionRepository: PositionRepository,
    private val getDatesFromVesselTrackDepth: GetDatesFromVesselTrackDepth,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetVesselPositions::class.java)

    suspend fun execute(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        trackDepth: VesselTrackDepth,
        vesselIdentifier: VesselIdentifier?,
        fromDateTime: ZonedDateTime? = null,
        toDateTime: ZonedDateTime? = null,
    ): Pair<Boolean, Deferred<List<Position>>> {
        val dates =
            getDatesFromVesselTrackDepth.execute(
                internalReferenceNumber = internalReferenceNumber,
                trackDepth = trackDepth,
                fromDateTime = fromDateTime,
                toDateTime = toDateTime,
            )

        return coroutineScope {
            val positionsFuture =
                findPositionsAsync(
                    vesselIdentifier = vesselIdentifier,
                    internalReferenceNumber = internalReferenceNumber,
                    from = dates.from,
                    to = dates.to,
                    ircs = ircs,
                    externalReferenceNumber = externalReferenceNumber,
                )

            Pair(
                dates.isTrackDepthModified,
                positionsFuture,
            )
        }
    }

    private fun CoroutineScope.findPositionsAsync(
        vesselIdentifier: VesselIdentifier?,
        internalReferenceNumber: String,
        from: ZonedDateTime?,
        to: ZonedDateTime?,
        ircs: String,
        externalReferenceNumber: String,
    ): Deferred<List<Position>> =
        when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                async {
                    positionRepository
                        .findVesselLastPositionsByInternalReferenceNumber(
                            internalReferenceNumber = internalReferenceNumber,
                            from = from!!,
                            to = to!!,
                        ).sortedBy { it.dateTime }
                }
            VesselIdentifier.IRCS ->
                async {
                    positionRepository
                        .findVesselLastPositionsByIrcs(ircs = ircs, from = from!!, to = to!!)
                        .sortedBy { it.dateTime }
                }
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                async {
                    positionRepository
                        .findVesselLastPositionsByExternalReferenceNumber(
                            externalReferenceNumber = externalReferenceNumber,
                            from = from!!,
                            to = to!!,
                        ).sortedBy { it.dateTime }
                }
            else ->
                async {
                    positionRepository
                        .findVesselLastPositionsWithoutSpecifiedIdentifier(
                            internalReferenceNumber = internalReferenceNumber,
                            externalReferenceNumber = externalReferenceNumber,
                            ircs = ircs,
                            from = from!!,
                            to = to!!,
                        ).sortedBy { it.dateTime }
                }
        }
}
