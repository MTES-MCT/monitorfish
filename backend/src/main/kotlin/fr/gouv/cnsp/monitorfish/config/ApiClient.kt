package fr.gouv.cnsp.monitorfish.config

import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.java.Java
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import org.springframework.context.annotation.Configuration

@Configuration
class ApiClient(
    engine: HttpClientEngine = Java.create(),
) {
    val httpClient =
        HttpClient(engine) {
            expectSuccess = true
            install(HttpTimeout) {
                connectTimeoutMillis = CONNECT_TIMEOUT_MILLIS
                requestTimeoutMillis = REQUEST_TIMEOUT_MILLIS
            }
            install(ContentNegotiation) {
                json(
                    Json {
                        prettyPrint = true
                        isLenient = true
                        ignoreUnknownKeys = true
                    },
                )
            }
        }

    companion object {
        private const val CONNECT_TIMEOUT_MILLIS = 2_000L

        // Bounds blocked request threads when a remote API (e.g. MonitorEnv) hangs,
        // while leaving room for Tchap uploads (max 5MB)
        private const val REQUEST_TIMEOUT_MILLIS = 10_000L
    }
}
