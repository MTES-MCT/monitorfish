package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ManualPriorNotificationEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBManualPriorNotificationRepository : JpaRepository<ManualPriorNotificationEntity, String> {
    @Query(
        """
        WITH
            manual_prior_notifications_with_extra_columns AS (
                SELECT
                    mpn.*,
                    (SELECT array_agg(pnoTypes->>'pnoTypeName') FROM jsonb_array_elements(mpn.value->'pnoTypes') AS pnoTypes) AS prior_notification_type_names,
                    (SELECT array_agg(catchOnboard->>'species') FROM jsonb_array_elements(mpn.value->'catchOnboard') AS catchOnboard) AS specy_codes,
                    (SELECT array_agg(tripGears->>'gear') FROM jsonb_array_elements(mpn.trip_gears) AS tripGears) AS trip_gear_codes,
                    (SELECT array_agg(tripSegments->>'segment') FROM jsonb_array_elements(mpn.trip_segments) AS tripSegments) AS trip_segment_codes
                FROM manual_prior_notifications mpn
                LEFT JOIN risk_factors rf ON mpn.vessel_id = rf.vessel_id
                LEFT JOIN vessels v ON mpn.vessel_id = v.id
                WHERE
                    -- TODO /!\ INDEX created_at WITH TIMESCALE /!\
                    -- This filter helps Timescale optimize the query since `created_at` is indexed
                    mpn.created_at
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    -- Flag States
                    AND (:flagStates IS NULL OR mpn.flag_state IN (:flagStates))

                    -- Is Less Than Twelve Meters Vessel
                    AND (
                        :isLessThanTwelveMetersVessel IS NULL
                        OR (:isLessThanTwelveMetersVessel = TRUE AND v.length < 12)
                        OR (:isLessThanTwelveMetersVessel = FALSE AND v.length >= 12)
                    )

                    -- Last Controlled After
                    AND (:lastControlledAfter IS NULL OR rf.last_control_datetime_utc >= CAST(:lastControlledAfter AS TIMESTAMP))

                    -- Last Controlled Before
                    AND (:lastControlledBefore IS NULL OR rf.last_control_datetime_utc <= CAST(:lastControlledBefore AS TIMESTAMP))

                    -- Port Locodes
                    AND (:portLocodes IS NULL OR mpn.value->>'port' IN (:portLocodes))

                    -- Search Query
                    AND (
                        :searchQuery IS NULL OR
                        unaccent(lower(mpn.vessel_name)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%') OR
                        unaccent(lower(mpn.cfr)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%')
                    )

                    -- Will Arrive After
                    AND mpn.value->>'predictedArrivalDatetimeUtc' >= :willArriveAfter

                    -- Will Arrive Before
                    AND mpn.value->>'predictedArrivalDatetimeUtc' <= :willArriveBefore
            ),

            distinct_vessel_ids AS (
                SELECT DISTINCT vessel_id
                FROM manual_prior_notifications_with_extra_columns
            ),

            vessel_id_reporting_counts AS (
                SELECT
                    dc.vessel_id,
                    COUNT(r.id) AS reporting_count
                FROM distinct_vessel_ids dc
                LEFT JOIN reportings r ON dc.vessel_id = r.vessel_id
                WHERE
                    r.type = 'INFRACTION_SUSPICION'
                    AND r.archived = FALSE
                    AND r.deleted = FALSE
                GROUP BY dc.vessel_id
            ),

            manual_prior_notifications_with_extra_columns_and_reporting_count AS (
                SELECT
                    mpnwecarc.*,
                    COALESCE(vrc.reporting_count, 0) AS reporting_count
                FROM manual_prior_notifications_with_extra_columns mpnwecarc
                LEFT JOIN vessel_id_reporting_counts vrc ON mpnwecarc.vessel_id = vrc.vessel_id
            ),

            filtered_manual_prior_notifications AS (
                SELECT *
                FROM manual_prior_notifications_with_extra_columns_and_reporting_count
                WHERE
                    -- Has One Or More Reportings
                    (
                        :hasOneOrMoreReportings IS NULL
                        OR (:hasOneOrMoreReportings = TRUE AND reporting_count > 0)
                        OR (:hasOneOrMoreReportings = FALSE AND reporting_count = 0)
                    )

                    -- Prior Notification Types
                    AND (:priorNotificationTypesAsSqlArrayString IS NULL OR prior_notification_type_names && CAST(:priorNotificationTypesAsSqlArrayString AS TEXT[]))

                    -- Specy Codes
                    AND (:specyCodesAsSqlArrayString IS NULL OR specy_codes && CAST(:specyCodesAsSqlArrayString AS TEXT[]))

                    -- Trip Gear Codes
                    AND (:tripGearCodesAsSqlArrayString IS NULL OR trip_gear_codes && CAST(:tripGearCodesAsSqlArrayString AS TEXT[]))

                    -- Trip Segment Codes
                    AND (:tripSegmentCodesAsSqlArrayString IS NULL OR trip_segment_codes && CAST(:tripSegmentCodesAsSqlArrayString AS TEXT[]))
            )

        SELECT *
        FROM filtered_manual_prior_notifications
        """,
        nativeQuery = true,
    )
    fun findAll(
        flagStates: List<String>,
        hasOneOrMoreReportings: Boolean?,
        isLessThanTwelveMetersVessel: Boolean?,
        lastControlledAfter: String?,
        lastControlledBefore: String?,
        portLocodes: List<String>,
        priorNotificationTypesAsSqlArrayString: String?,
        searchQuery: String?,
        specyCodesAsSqlArrayString: String?,
        tripGearCodesAsSqlArrayString: String?,
        tripSegmentCodesAsSqlArrayString: String?,
        willArriveAfter: String,
        willArriveBefore: String,
    ): List<ManualPriorNotificationEntity>

    @Query(
        """
        SELECT *
        FROM manual_prior_notifications
        WHERE report_id = :reportId
        """,
        nativeQuery = true,
    )
    fun findByReportId(reportId: String): ManualPriorNotificationEntity?

    fun save(entity: ManualPriorNotificationEntity): ManualPriorNotificationEntity
}
