package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.AddReporting
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime


@ExtendWith(SpringExtension::class)
class AddReportingUTests {

  @MockBean
  private lateinit var reportingRepository: ReportingRepository

  @Test
  fun `execute Should throw an exception When the reporting is an alert`() {
    // Given
    val reportingToAdd = Reporting(
      id = 1,
      type = ReportingType.ALERT,
      vesselName = "BIDUBULE",
      internalReferenceNumber = "FR224226850",
      externalReferenceNumber = "1236514",
      ircs = "IRCS",
      vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      creationDate = ZonedDateTime.now(),
      validationDate = ZonedDateTime.now(),
      value = ThreeMilesTrawlingAlert() as ReportingValue,
      isArchived = false,
      isDeleted = false)

    // When
    val throwable = catchThrowable {
      AddReporting(reportingRepository).execute(reportingToAdd)
    }

    // Then
    assertThat(throwable.message).contains("The reporting type must be OBSERVATION or INFRACTION_SUSPICION")
  }

  @ParameterizedTest
  @EnumSource(ReportingActor::class)
  fun `execute Should throw an exception When fields of reporting actor are not rights`(reportingActor: ReportingActor) {
    // Given
    val reportingToAdd = Reporting(
      id = 1,
      type = ReportingType.OBSERVATION,
      vesselName = "BIDUBULE",
      internalReferenceNumber = "FR224226850",
      externalReferenceNumber = "1236514",
      ircs = "IRCS",
      vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      creationDate = ZonedDateTime.now(),
      validationDate = ZonedDateTime.now(),
      value = Observation(reportingActor = reportingActor, title = "A title"),
      isArchived = false,
      isDeleted = false)

    // When
    val throwable = catchThrowable {
      AddReporting(reportingRepository).execute(reportingToAdd)
    }

    // Then
    when (reportingActor) {
      ReportingActor.OPS -> assertThat(throwable.message).contains("An author trigram must be set")
      ReportingActor.SIP -> assertThat(throwable.message).contains("An author trigram must be set")
      ReportingActor.UNIT -> assertThat(throwable.message).contains("An unit must be set")
      ReportingActor.DML -> assertThat(throwable.message).contains("An author contact must be set")
      ReportingActor.DIRM -> assertThat(throwable.message).contains("An author contact must be set")
      ReportingActor.OTHER -> assertThat(throwable.message).contains("An author contact must be set")
    }
  }
}
