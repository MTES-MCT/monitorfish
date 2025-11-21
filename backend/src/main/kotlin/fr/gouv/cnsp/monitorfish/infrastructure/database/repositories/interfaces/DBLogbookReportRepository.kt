package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant
import java.time.ZonedDateTime

@DynamicUpdate
interface DBLogbookReportRepository :
    CrudRepository<LogbookReportEntity, Long>,
    JpaSpecificationExecutor<LogbookReportEntity> {
    @Query(
        """
        SELECT * FROM find_all_enriched_pno_references_and_related_operations(
            (:willArriveAfter)::TIMESTAMP WITHOUT TIME ZONE,
            (:willArriveBefore)::TIMESTAMP WITHOUT TIME ZONE,
            :flagStates,
            :isLessThanTwelveMetersVessel,
            :lastControlledAfter,
            :lastControlledBefore,
            :portLocodes,
            :searchQuery,
            :hasOneOrMoreReportings,
            :priorNotificationTypesAsSqlArrayString,
            :specyCodesAsSqlArrayString,
            :tripGearCodesAsSqlArrayString,
            :tripSegmentCodesAsSqlArrayString
        )
        """,
        nativeQuery = true,
    )
    fun findAllEnrichedPnoReferencesAndRelatedOperations(
        flagStates: String?,
        hasOneOrMoreReportings: Boolean?,
        isLessThanTwelveMetersVessel: Boolean?,
        lastControlledAfter: String?,
        lastControlledBefore: String?,
        portLocodes: String?,
        priorNotificationTypesAsSqlArrayString: String?,
        searchQuery: String?,
        specyCodesAsSqlArrayString: String?,
        tripGearCodesAsSqlArrayString: String?,
        tripSegmentCodesAsSqlArrayString: String?,
        willArriveAfter: String,
        willArriveBefore: String,
    ): List<LogbookReportEntity>

    @Query(
        """
        WITH snapshot_trips AS (
            SELECT
                trip_number,
                sort_order_datetime_utc,
                first_operation_datetime_utc,
                last_operation_datetime_utc
            FROM trips_snapshot
            WHERE cfr = :internalReferenceNumber
        ),

        latest_trips AS (
            SELECT
                trip_number,
                COALESCE(
                    MIN(
                        CASE WHEN ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5
                        THEN activity_datetime_utc
                    END),
                    MIN(operation_datetime_utc)
                ) AS sort_order_datetime_utc,
                MIN(operation_datetime_utc) AS first_operation_datetime_utc,
                MAX(operation_datetime_utc) AS last_operation_datetime_utc
            FROM logbook_reports
            WHERE
                operation_datetime_utc >= NOW() AT TIME ZONE 'UTC' - INTERVAL '24 hours'
                AND operation_datetime_utc < NOW() AT TIME ZONE 'UTC' + INTERVAL '24 hours'
                AND cfr = :internalReferenceNumber
                AND trip_number IS NOT NULL
            GROUP BY trip_number
        )

        SELECT
            COALESCE(st.trip_number, lt.trip_number) AS trip_number,
            LEAST(st.sort_order_datetime_utc, lt.sort_order_datetime_utc) AS sort_order_datetime_utc,
            LEAST(st.first_operation_datetime_utc, lt.first_operation_datetime_utc) AS first_operation_datetime_utc,
            GREATEST(st.last_operation_datetime_utc, lt.last_operation_datetime_utc) AS last_operation_datetime_utc
        FROM snapshot_trips st
        FULL OUTER JOIN latest_trips lt
        ON st.trip_number = lt.trip_number
        ORDER BY 2
        """,
        nativeQuery = true,
    )
    fun findAllTrips(
        internalReferenceNumber: String,
    ): List<Array<Any>>

    /**
     * This query either returns:
     * - 1 element if the report id is found, not corrected and not deleted
     * - 0 element
     */
    @Query(
        "SELECT * FROM find_pno_by_report_id(:reportId, (:operationDate)::TIMESTAMP WITHOUT TIME ZONE)",
        nativeQuery = true,
    )
    fun findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
        reportId: String,
        operationDate: String,
    ): List<LogbookReportEntity>


    @Query(
        """SELECT
            start_date,
            end_date
        FROM find_dates_of_trip(
            :internalReferenceNumber,
            :tripNumber,
            :firstOperationDateTime,
            :lastOperationDateTime
        )""",
        nativeQuery = true
    )
    fun findDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
        firstOperationDateTime: ZonedDateTime,
        lastOperationDateTime: ZonedDateTime
    ): List<Array<Instant>>


    @Query(
        """
        SELECT *
        FROM find_logbook_by_trip_number(
            :internalReferenceNumber,
            :firstOperationDateTime,
            :lastOperationDateTime,
            :tripNumber
        )""",
        nativeQuery = true,
    )
    fun findAllMessagesByTripNumberBetweenOperationDates(
        internalReferenceNumber: String,
        firstOperationDateTime: ZonedDateTime,
        lastOperationDateTime: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookReportEntity>

    @Query(
        """
            select find_last_operation_datetime()
        """,
        nativeQuery = true,
    )
    fun findLastOperationDateTime(): Instant

    @Query(
        """
            SELECT find_last_operation_number(:internalReferenceNumber)
        """,
        nativeQuery = true,
    )
    fun findLastOperationNumber(internalReferenceNumber: String): String?

    @Query(
        """
            SELECT find_last_software(:internalReferenceNumber)
        """,
        nativeQuery = true,
    )
    fun findLastReportSoftware(internalReferenceNumber: String): String?

    @Query(
        """SELECT distinct e.trip_number
        FROM logbook_reports e
        WHERE e.cfr = :internalReferenceNumber
        AND e.trip_number IS NOT NULL
        AND e.operation_type IN ('DAT', 'COR')
        AND NOT e.is_test_message
        AND e.operation_datetime_utc > now() - interval '3 year'
        ORDER BY e.trip_number DESC
    """,
        nativeQuery = true,
    )
    fun findLastThreeYearsTripNumbers(internalReferenceNumber: String): List<String>

    @Query(
        """
        SELECT DISTINCT jsonb_array_elements(value->'pnoTypes')->>'pnoTypeName' AS uniquePnoTypeName
        FROM logbook_reports
        WHERE log_type = 'PNO'
        AND operation_datetime_utc > now() - interval '2 year'
        ORDER BY uniquePnoTypeName
        """,
        nativeQuery = true,
    )
    fun findDistinctPriorNotificationType(): List<String>?

    @Query(
        """
        SELECT DISTINCT
            cfr
        FROM
            logbook_reports
        WHERE
            (software LIKE 'JT%' OR software LIKE 'FT%') AND
            operation_datetime_utc >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '12 months'
        """,
        nativeQuery = true,
    )
    fun findAllCfrWithVisioCaptures(): List<String>
}
