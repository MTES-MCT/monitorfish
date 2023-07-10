package fr.gouv.cnsp.monitorfish

import io.sentry.Sentry
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MonitorFishApplication

fun main(args: Array<String>) {
    val ctx = runApplication<MonitorFishApplication>(*args)

    val isSentryEnabled: String? = ctx.environment.getProperty("monitorfish.sentry.enabled")
    val sentryDsn: String? = ctx.environment.getProperty("sentry.dsn")

    if (isSentryEnabled == "true") {
        Sentry.init { options ->
            options.dsn = sentryDsn
            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // We recommend adjusting this value in production.
            options.tracesSampleRate = 1.0
        }
    }
}
