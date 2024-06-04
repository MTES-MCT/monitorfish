package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LogbookSoftwareUTests {
    @Test
    fun `isVisioCapture Should return False if the software is not under VisioCaptures`() {
        // When
        val isVisioCapture = LogbookSoftware.isVisioCaptureInRealTime("e-Sacapt")

        // Then
        assertThat(isVisioCapture).isFalse()
    }

    @Test
    fun `isVisioCapture Should return True if the software is under VisioCaptures`() {
        // When
        val isVisioCapture = LogbookSoftware.isVisioCaptureInRealTime("FT-Visio...")

        // Then
        assertThat(isVisioCapture).isTrue()
    }
}
