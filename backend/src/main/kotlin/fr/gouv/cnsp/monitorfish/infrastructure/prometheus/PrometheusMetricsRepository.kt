package fr.gouv.cnsp.monitorfish.infrastructure.prometheus

import fr.gouv.cnsp.monitorfish.domain.repositories.MetricsRepository
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Metrics
import org.springframework.stereotype.Repository

@Repository
class PrometheusMetricsRepository(meterRegistry: MeterRegistry) : MetricsRepository {
    private val MISSING_CODE_WARNING = "ws_missing_code_counter"
    private val CODE_TYPE_TAG = "codeType"
    private val CODE_TAG = "code"

    init {
        Counter.builder(MISSING_CODE_WARNING)
                .description("Missing codes")
                .tags(CODE_TYPE_TAG, "", CODE_TAG, "")
                .register(meterRegistry);
    }

    override fun sendMissingCodeWarning(codeType: String, code: String) {
        Metrics.counter(MISSING_CODE_WARNING, CODE_TYPE_TAG, codeType, CODE_TAG, code).increment()
    }
}
