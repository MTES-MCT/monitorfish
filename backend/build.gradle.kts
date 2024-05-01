plugins {
    `java-library`
    `maven-publish`
    id("org.springframework.boot") version "3.1.7"
    id("org.jetbrains.kotlin.plugin.spring") version "1.9.23"
    kotlin("jvm") version "1.9.22"
    id("org.jetbrains.kotlin.plugin.allopen") version "1.9.22"
    kotlin("plugin.noarg") version "1.9.10"
    kotlin("plugin.jpa") version "1.9.22"
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1"
    kotlin("plugin.serialization") version "1.9.23"
}

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(17)
}

noArg {
    invokeInitializers = true
}

configurations.all {
    exclude(group = "org.springframework.boot", module = "spring-boot-starter-logging")
}

tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")
        // jvmTarget.set(JvmTarget.JVM_17)
        // javaParameters.set(true)
    }
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-web:3.1.7")
    api("org.springframework.security:spring-security-oauth2-resource-server:6.1.5")
    api("org.springframework.security:spring-security-oauth2-jose:6.1.5")
    api("org.springframework.boot:spring-boot-starter-actuator:3.1.7")
    api("org.springframework.boot:spring-boot-starter-json:3.1.7")
    api("org.springframework.boot:spring-boot-starter-security:3.1.7")
    api("org.springframework.boot:spring-boot-starter-data-jpa:3.1.7")
    api("org.springframework.boot:spring-boot-configuration-processor:3.1.7")
    api("org.springframework.boot:spring-boot-starter-cache:3.1.7")
    api("org.springframework.boot:spring-boot-starter-log4j2:3.1.7")
    runtimeOnly("org.springframework.boot:spring-boot-devtools:3.1.7")
    api("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    api("io.ktor:ktor-client-core-jvm:2.3.6")
    api("io.ktor:ktor-client-java-jvm:2.3.3")
    api("io.ktor:ktor-client-content-negotiation-jvm:2.3.3")
    api("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.8")
    api("org.hibernate.validator:hibernate-validator:8.0.1.Final")
    api("jakarta.validation:jakarta.validation-api:3.0.2")
    api("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.1")
    api("com.nhaarman.mockitokotlin2:mockito-kotlin:2.2.0")
    api("org.flywaydb:flyway-core:10.5.0")
    api("org.flywaydb:flyway-database-postgresql:10.5.0")
    api("org.springdoc:springdoc-openapi-ui:1.7.0")
    api("org.jetbrains.kotlin:kotlin-reflect:1.9.22")
    api("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.10")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    api("com.neovisionaries:nv-i18n:1.29")
    api("com.github.ben-manes.caffeine:caffeine:3.1.8")
    api("io.hypersistence:hypersistence-utils-hibernate-62:3.7.1")
    api("org.locationtech.jts:jts-core:1.19.0")
    api("org.hibernate:hibernate-spatial:6.1.7.Final")
    api("io.sentry:sentry:6.31.0")
    api("io.sentry:sentry-log4j2:7.5.0")
    runtimeOnly("org.postgresql:postgresql:42.7.3")
    testImplementation("io.ktor:ktor-client-mock-jvm:2.3.9")
    testImplementation("org.assertj:assertj-core:3.25.0")
    testImplementation("org.testcontainers:postgresql:1.19.4")
    testImplementation("org.testcontainers:testcontainers:1.19.4")
    testImplementation("org.testcontainers:junit-jupiter:1.19.4")
    testImplementation("jakarta.servlet:jakarta.servlet-api:6.0.0")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.11.0")
    testImplementation("org.springframework.boot:spring-boot-starter-test:3.1.7")
    testImplementation("org.springframework.restdocs:spring-restdocs-mockmvc:3.0.1")
}

group = "fr.gouv.cnsp"
version = "VERSION_TO_CHANGE"
description = "MonitorFish"
java.sourceCompatibility = JavaVersion.VERSION_17

publishing {
    publications.create<MavenPublication>("maven") {
        from(components["java"])
    }
}

springBoot {
    mainClass.set("fr.gouv.cnsp.monitorfish.MonitorFishApplicationKt")

    buildInfo {
        properties {
            additional = mapOf(
                "commit.hash" to "COMMIT_TO_CHANGE",
            )
        }
    }
}

tasks.withType<JavaCompile>() {
    options.encoding = "UTF-8"
}

tasks.withType<Javadoc>() {
    options.encoding = "UTF-8"
}

configure<org.jlleitschuh.gradle.ktlint.KtlintExtension> {
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
