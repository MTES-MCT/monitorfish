import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.jlleitschuh.gradle.ktlint.KtlintExtension

val springBootVersion = "4.0.7"
val kotlinVersion = "2.4.0"
val springSecurityVersion = "7.1.0"

plugins {
    `java-library`
    `maven-publish`

    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.jetbrains.kotlin.plugin.spring") version "2.4.0"
    id("org.jetbrains.kotlin.plugin.allopen") version "2.4.0"

    kotlin("jvm") version "2.4.0"
    kotlin("plugin.noarg") version "2.4.0"
    kotlin("plugin.jpa") version "2.4.0"
    kotlin("plugin.serialization") version "2.4.0"

    id("org.jlleitschuh.gradle.ktlint") version "13.1.0"
}

group = "fr.gouv.cnsp"
version = "VERSION_TO_CHANGE"
description = "MonitorFish"
java.sourceCompatibility = JavaVersion.VERSION_21

publishing {
    publications.create<MavenPublication>("maven") {
        from(components["java"])
    }
}

springBoot {
    mainClass.set("fr.gouv.cnsp.monitorfish.MonitorFishApplicationKt")

    buildInfo {
        properties {
            additional =
                mapOf(
                    "commit.hash" to "COMMIT_TO_CHANGE",
                )
        }
    }
}

// this is to address https://github.com/JLLeitschuh/ktlint-gradle/issues/809
ktlint {
    version = "1.5.0"
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2025.1.2")
    }

    // Ktor 3.5 is compiled against kotlinx-coroutines 1.11. An imported BOM otherwise pins the
    // *-jvm coroutines artifacts to 1.8.1, causing a java.lang.NoSuchMethodError at runtime in the
    // Ktor HTTP client. Override the managed version so every coroutines artifact stays aligned.
    dependencies {
        dependency("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
        dependency("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.11.0")
        dependency("org.jetbrains.kotlinx:kotlinx-coroutines-jdk8:1.11.0")
        dependency("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:1.11.0")
    }
}

repositories {
    mavenCentral()
    gradlePluginPortal()
}

kotlin {
    jvmToolchain(21)
}

noArg {
    invokeInitializers = true
}

configurations.all {
    exclude(group = "org.springframework.boot", module = "spring-boot-starter-logging")
}

tasks.withType<KotlinCompile> {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
        freeCompilerArgs.set(listOf("-Xjsr305=strict"))
    }
}

dependencies {
    // Spring Boot
    api("org.springframework.boot:spring-boot-starter-web:$springBootVersion")
    api("org.springframework.boot:spring-boot-starter-json:$springBootVersion")
    api("org.springframework.boot:spring-boot-starter-security:$springBootVersion")
    api("org.springframework.boot:spring-boot-starter-data-jpa:$springBootVersion")
    implementation("org.springframework.boot:spring-boot-configuration-processor:$springBootVersion")
    api("org.springframework.boot:spring-boot-starter-cache:$springBootVersion")
    api("org.springframework.boot:spring-boot-starter-log4j2:$springBootVersion")
    api("org.springframework.security:spring-security-oauth2-resource-server:$springSecurityVersion")
    api("org.springframework.security:spring-security-oauth2-jose:$springSecurityVersion")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    // Renamed from spring-cloud-gateway-mvc in Spring Cloud 2025.x; version managed by the BOM so it
    // stays compatible with Spring Boot 4. Keeps the org.springframework.cloud.gateway.mvc.* package.
    implementation("org.springframework.cloud:spring-cloud-gateway-proxyexchange-webmvc")
    implementation("org.springframework.kafka:spring-kafka")
    // Spring Boot 4 split several pieces out of spring-boot / spring-boot-autoconfigure into
    // dedicated modules that are no longer pulled transitively by the web starter.
    implementation("org.springframework.boot:spring-boot-restclient:$springBootVersion")
    implementation("org.springframework.boot:spring-boot-kafka:$springBootVersion")
    implementation("org.springframework.boot:spring-boot-flyway:$springBootVersion")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect:$kotlinVersion")
    api("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlinVersion")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")

    // HTTP client
    implementation("io.ktor:ktor-client-core-jvm:3.5.1")
    implementation("io.ktor:ktor-client-java-jvm:3.5.1")
    implementation("io.ktor:ktor-client-content-negotiation-jvm:3.5.1")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:3.5.1")

    // Data / persistence
    implementation("org.flywaydb:flyway-core:12.9.0")
    implementation("org.flywaydb:flyway-database-postgresql:12.9.0")
    implementation("org.hibernate.validator:hibernate-validator:8.0.2.Final")
    // Version managed by the Spring Boot BOM so it stays aligned with the managed hibernate-core
    // (an explicit newer hibernate-spatial pulls APIs absent from the BOM's hibernate-core).
    implementation("org.hibernate.orm:hibernate-spatial")
    implementation("io.hypersistence:hypersistence-utils-hibernate-71:3.15.3")
    api("org.locationtech.jts:jts-core:1.20.0")
    implementation("org.n52.jackson:jackson-datatype-jts:2.0.0")
    implementation("org.locationtech.proj4j:proj4j:1.4.3")
    implementation("org.locationtech.proj4j:proj4j-epsg:1.4.3")
    runtimeOnly("org.postgresql:postgresql:42.7.11")

    // Serialization / API
    api("com.fasterxml.jackson.module:jackson-module-kotlin:2.22.0")
    // Required to (de)serialize java.util.Optional (e.g. PatchableMissionActionDataInput): since the
    // Spring Boot 4 upgrade the starters ship Jackson 3 and no longer pull this Jackson 2 module.
    api("com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.22.0")
    implementation("jakarta.validation:jakarta.validation-api:3.1.1")
    api("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.3")

    // Utilities
    api("com.neovisionaries:nv-i18n:1.29")
    implementation("com.github.ben-manes.caffeine:caffeine:3.2.4")
    implementation("io.sentry:sentry:8.44.1")
    implementation("io.sentry:sentry-log4j2:8.44.1")

    // Runtime
    runtimeOnly("org.springframework.boot:spring-boot-devtools:$springBootVersion")

    // Test
    testImplementation("io.ktor:ktor-client-mock-jvm:3.5.1")
    testImplementation("org.springframework.kafka:spring-kafka-test") {
        exclude(group = "ch.qos.logback", module = "logback-classic")
    }
    testImplementation("com.nhaarman.mockitokotlin2:mockito-kotlin:2.2.0")
    testImplementation("org.awaitility:awaitility:4.3.0")
    testImplementation("org.assertj:assertj-core:3.27.7")
    testImplementation("org.testcontainers:testcontainers:2.0.5")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter:2.0.5")
    testImplementation("org.testcontainers:testcontainers-postgresql:2.0.5")
    testImplementation("org.testcontainers:testcontainers-kafka:2.0.5")
    testImplementation("jakarta.servlet:jakarta.servlet-api:6.1.0")
    testImplementation("com.squareup.okhttp3:mockwebserver:5.4.0")
    testImplementation("org.springframework.boot:spring-boot-starter-test:$springBootVersion")
    testImplementation("org.springframework.boot:spring-boot-webmvc-test:$springBootVersion")
    testImplementation("org.springframework.security:spring-security-test:$springSecurityVersion")
    testImplementation("org.springframework.restdocs:spring-restdocs-mockmvc:3.0.5")
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

tasks.withType<Javadoc> {
    options.encoding = "UTF-8"
}

configure<KtlintExtension> {
    verbose.set(true)
    android.set(false)
    outputToConsole.set(true)
    ignoreFailures.set(false)
    // Existing accepted violations are recorded in a baseline so ktlintCheck only fails on new ones.
    baseline.set(file("config/ktlint/baseline.xml"))
}

tasks.named<Test>("test") {
    useJUnitPlatform()

    // Run tests in UTC, matching the production runtime. Without this, timestamps read from
    // `timestamp without time zone` columns are materialized in the host's default timezone,
    // which breaks time-sensitive assertions on developer machines outside UTC.
    systemProperty("user.timezone", "UTC")

    testLogging {
        events("passed")
    }
}
