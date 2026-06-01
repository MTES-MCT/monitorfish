import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.jlleitschuh.gradle.ktlint.KtlintExtension

val springBootVersion = "3.5.8"
val kotlinVersion = "2.3.21"
val springSecurityVersion = "7.0.5"

plugins {
    `java-library`
    `maven-publish`

    id("org.springframework.boot") version "3.5.8"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.jetbrains.kotlin.plugin.spring") version "2.3.21"
    id("org.jetbrains.kotlin.plugin.allopen") version "2.3.21"

    kotlin("jvm") version "2.3.21"
    kotlin("plugin.noarg") version "2.3.21"
    kotlin("plugin.jpa") version "2.3.21"
    kotlin("plugin.serialization") version "2.3.21"

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
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2025.1.1")
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
    implementation("org.springframework.cloud:spring-cloud-gateway-mvc:4.3.4")
    implementation("org.springframework.kafka:spring-kafka")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect:$kotlinVersion")
    api("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlinVersion")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")

    // HTTP client
    implementation("io.ktor:ktor-client-core-jvm:3.4.3")
    implementation("io.ktor:ktor-client-java-jvm:3.4.3")
    implementation("io.ktor:ktor-client-content-negotiation-jvm:3.4.3")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:3.4.3")

    // Data / persistence
    implementation("org.flywaydb:flyway-core:11.18.0")
    implementation("org.flywaydb:flyway-database-postgresql:11.18.0")
    implementation("org.hibernate.validator:hibernate-validator:8.0.2.Final")
    implementation("org.hibernate:hibernate-spatial:7.3.2.Final")
    implementation("io.hypersistence:hypersistence-utils-hibernate-63:3.15.2")
    api("org.locationtech.jts:jts-core:1.20.0")
    implementation("org.n52.jackson:jackson-datatype-jts:2.0.0")
    implementation("org.locationtech.proj4j:proj4j:1.4.1")
    implementation("org.locationtech.proj4j:proj4j-epsg:1.4.1")
    runtimeOnly("org.postgresql:postgresql:42.7.10")

    // Serialization / API
    api("com.fasterxml.jackson.module:jackson-module-kotlin:2.21.2")
    implementation("jakarta.validation:jakarta.validation-api:3.1.1")
    api("org.springdoc:springdoc-openapi-ui:1.8.0")

    // Utilities
    api("com.neovisionaries:nv-i18n:1.29")
    implementation("com.github.ben-manes.caffeine:caffeine:3.2.3")
    implementation("io.sentry:sentry:8.40.0")
    implementation("io.sentry:sentry-log4j2:8.40.0")

    // Runtime
    runtimeOnly("org.springframework.boot:spring-boot-devtools:$springBootVersion")

    // Test
    testImplementation("io.ktor:ktor-client-mock-jvm:3.4.3")
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
    testImplementation("com.squareup.okhttp3:mockwebserver:5.3.2")
    testImplementation("org.springframework.boot:spring-boot-starter-test:$springBootVersion")
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
    ignoreFailures.set(true)
}

tasks.named<Test>("test") {
    useJUnitPlatform()

    testLogging {
        events("passed")
    }
}
