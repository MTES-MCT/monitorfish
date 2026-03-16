package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class ReportingUTests {
    private val now: ZonedDateTime = ZonedDateTime.now()

    private val baseInfractionSuspicion =
        Reporting.InfractionSuspicion(
            id = 1,
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = ReportingSource.UNIT,
            controlUnitId = 1,
            title = "Title",
            natinfCode = 1234,
            threat = "T",
            threatCharacterization = "TC",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
            latitude = 1.0,
            longitude = 2.0,
            satelliteType = SatelliteSource.COPERNICUS,
            otherSourceType = null,
            isFishing = false,
        )

    private val baseObservation =
        Reporting.Observation(
            id = 2,
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = ReportingSource.UNIT,
            controlUnitId = 1,
            title = "Title",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
            latitude = 3.0,
            longitude = 4.0,
            satelliteType = SatelliteSource.OTHER,
            otherSourceType = null,
            isFishing = false,
        )

    private fun makeCommand(
        type: ReportingType,
        latitude: Double? = 10.0,
        longitude: Double? = 20.0,
    ) = ReportingUpdateCommand(
        flagState = CountryCode.FR,
        reportingDate = now,
        latitude = latitude,
        longitude = longitude,
        satelliteType = SatelliteSource.OTHER,
        otherSourceType = OtherSource.NGO,
        isFishing = true,
        reportingSource = ReportingSource.UNIT,
        controlUnitId = 1,
        title = "Updated",
        natinfCode = 5678,
        threat = "T2",
        threatCharacterization = "TC2",
        type = type,
    )

    @Test
    fun `update Should update an Observation to an Observation`() {
        val command = makeCommand(ReportingType.OBSERVATION)

        val result = baseObservation.update(command)

        assertThat(result).isInstanceOf(Reporting.Observation::class.java)
        result as Reporting.Observation
        assertThat(result.title).isEqualTo("Updated")
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
    }

    @Test
    fun `update Should convert an Observation to an InfractionSuspicion with correct fields from command`() {
        val command = makeCommand(ReportingType.INFRACTION_SUSPICION)

        val result = baseObservation.update(command)

        assertThat(result).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        result as Reporting.InfractionSuspicion
        assertThat(result.type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
        assertThat(result.natinfCode).isEqualTo(5678)
        assertThat(result.threat).isEqualTo("T2")
        assertThat(result.threatCharacterization).isEqualTo("TC2")
        // Immutable fields preserved from original entity
        assertThat(result.id).isEqualTo(baseObservation.id)
        assertThat(result.creationDate).isEqualTo(baseObservation.creationDate)
        assertThat(result.createdBy).isEqualTo(baseObservation.createdBy)
    }

    @Test
    fun `update Should update an InfractionSuspicion to an InfractionSuspicion`() {
        val command = makeCommand(ReportingType.INFRACTION_SUSPICION)

        val result = baseInfractionSuspicion.update(command)

        assertThat(result).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        result as Reporting.InfractionSuspicion
        assertThat(result.title).isEqualTo("Updated")
        assertThat(result.natinfCode).isEqualTo(5678)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
    }

    @Test
    fun `update Should convert an InfractionSuspicion to an Observation with correct fields from command`() {
        val command = makeCommand(ReportingType.OBSERVATION)

        val result = baseInfractionSuspicion.update(command)

        assertThat(result).isInstanceOf(Reporting.Observation::class.java)
        result as Reporting.Observation
        assertThat(result.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
        // Immutable fields preserved from original entity
        assertThat(result.id).isEqualTo(baseInfractionSuspicion.id)
        assertThat(result.creationDate).isEqualTo(baseInfractionSuspicion.creationDate)
        assertThat(result.createdBy).isEqualTo(baseInfractionSuspicion.createdBy)
    }

    @Test
    fun `update Should preserve entity coordinates When command has null lat-lon for Observation to InfractionSuspicion`() {
        val command = makeCommand(ReportingType.INFRACTION_SUSPICION, latitude = null, longitude = null)

        val result = baseObservation.update(command) as Reporting.InfractionSuspicion

        assertThat(result.latitude).isEqualTo(baseObservation.latitude)
        assertThat(result.lorngitude).isEqualTo(baseObservation.longitude)
    }

    @Test
    fun `update Should preserve entity coordinates When command has null lat-lon for InfractionSuspicion to Observation`() {
        val command = makeCommand(ReportingType.OBSERVATION, latitude = null, longitude = null)

        val result = baseInfractionSuspicion.update(command) as Reporting.Observation

        assertThat(result.latitude).isEqualTo(baseInfractionSuspicion.latitude)
        assertThat(result.longitude).isEqualTo(baseInfractionSuspicion.longitude)
    }

    @Test
    fun `update Should fall back to entity threat and threatCharacterization When command provides null`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = 5678,
                threat = null,
                threatCharacterization = null,
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val result = baseInfractionSuspicion.update(command) as Reporting.InfractionSuspicion

        assertThat(result.threat).isEqualTo(baseInfractionSuspicion.threat)
        assertThat(result.threatCharacterization).isEqualTo(baseInfractionSuspicion.threatCharacterization)
    }

    @Test
    fun `update Should throw When natinfCode is null on InfractionSuspicion to InfractionSuspicion`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = null,
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val throwable = catchThrowable { baseInfractionSuspicion.update(command) }

        assertThat(throwable).isInstanceOf(IllegalStateException::class.java)
        assertThat(throwable.message).contains("NATINF code is required")
    }

    @Test
    fun `update Should throw When natinfCode is null on Observation to InfractionSuspicion`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = null,
                threat = "T2",
                threatCharacterization = "TC2",
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val throwable = catchThrowable { baseObservation.update(command) }

        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `update Should rewrite reportingSource and otherSourceType When DML source produces an Observation`() {
        // Observation init block rewrites DML → OTHER and sets otherSourceType = OtherSource.DM
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.DML,
                authorContact = "contact@example.fr",
                title = "Updated",
                type = ReportingType.OBSERVATION,
            )

        val result = baseObservation.update(command) as Reporting.Observation

        assertThat(result.reportingSource).isEqualTo(ReportingSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.DM)
    }

    @Test
    fun `update Should rewrite reportingSource and otherSourceType When DIRM source produces an Observation via cross-type`() {
        // Same init block rewrite applies when InfractionSuspicion is converted to Observation
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.DIRM,
                authorContact = "contact@example.fr",
                title = "Updated",
                type = ReportingType.OBSERVATION,
            )

        val result = baseInfractionSuspicion.update(command) as Reporting.Observation

        assertThat(result.reportingSource).isEqualTo(ReportingSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.DIRM)
    }

    @Test
    fun `update Should throw an IllegalArgumentException When called on an Alert`() {
        val alert =
            Reporting.Alert(
                id = 3,
                flagState = CountryCode.FR,
                creationDate = now,
                lastUpdateDate = now,
                reportingDate = now,
                isArchived = false,
                isDeleted = false,
                createdBy = "user@test.fr",
                alertType = AlertType.MISSING_DEP_ALERT,
                natinfCode = 1234,
                threat = "T",
                threatCharacterization = "TC",
                name = "Alert name",
            )

        val throwable = catchThrowable { alert.update(makeCommand(ReportingType.OBSERVATION)) }

        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("Alerts cannot be updated")
    }
}
