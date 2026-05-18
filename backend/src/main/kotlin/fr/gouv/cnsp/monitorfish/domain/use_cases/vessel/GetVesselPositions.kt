package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

@UseCase
class GetVesselPositions(
    private val positionRepository: PositionRepository,
    private val aisPositionRepository: AisPositionRepository,
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

        val aisFrom = ZonedDateTime.now(ZoneOffset.UTC).minusHours(12)
        val aisTo = ZonedDateTime.now(ZoneOffset.UTC)

        return coroutineScope {
            val vmsFuture =
                findPositionsAsync(
                    vesselIdentifier = vesselIdentifier,
                    internalReferenceNumber = internalReferenceNumber,
                    from = dates.from,
                    to = dates.to,
                    ircs = ircs,
                    externalReferenceNumber = externalReferenceNumber,
                )
            val aisFuture =
                findAisPositionsAsync(
                    vesselIdentifier = vesselIdentifier,
                    internalReferenceNumber = internalReferenceNumber,
                    from = aisFrom,
                    to = aisTo,
                    ircs = ircs,
                    externalReferenceNumber = externalReferenceNumber,
                )
            val mergedFuture =
                async {
                    (vmsFuture.await() + aisFuture.await()).sortedBy { it.dateTime }
                }

            Pair(dates.isTrackDepthModified, mergedFuture)
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

    private fun CoroutineScope.findAisPositionsAsync(
        vesselIdentifier: VesselIdentifier?,
        internalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
        ircs: String,
        externalReferenceNumber: String,
    ): Deferred<List<Position>> =
        when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                async {
                    aisPositionRepository.findVesselLastAisPositionsByCfr(internalReferenceNumber, from, to)
                }
            VesselIdentifier.IRCS ->
                async {
                    aisPositionRepository.findVesselLastAisPositionsByIrcs(ircs, from, to)
                }
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                async {
                    aisPositionRepository.findVesselLastAisPositionsByExternalImmatriculation(externalReferenceNumber, from, to)
                }
            else ->
                async {
                    when {
                        internalReferenceNumber.isNotEmpty() ->
                            aisPositionRepository.findVesselLastAisPositionsByCfr(internalReferenceNumber, from, to)
                        ircs.isNotEmpty() ->
                            aisPositionRepository.findVesselLastAisPositionsByIrcs(ircs, from, to)
                        externalReferenceNumber.isNotEmpty() ->
                            aisPositionRepository.findVesselLastAisPositionsByExternalImmatriculation(externalReferenceNumber, from, to)
                        else -> listOf()
                    }
                }
        }
}
