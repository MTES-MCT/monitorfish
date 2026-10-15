import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    `java-library`
    `maven-publish`
    kotlin("jvm")
    id("org.jlleitschuh.gradle.ktlint")
}

group = "fr.gouv.cnsp"
version = findProperty("contractVersion") ?: "0.0.0-SNAPSHOT"
description = "Types of the MonitorFish public API, shared with its consumers (e.g. RapportNav)"

repositories {
    mavenCentral()
}

java {
    withSourcesJar()
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

// Consumers bring their own Jackson (2 or 3) runtime: both read the annotations of the 2.x `jackson-annotations` artifact.
dependencies {
    api("com.fasterxml.jackson.core:jackson-annotations:2.20")
    api("com.neovisionaries:nv-i18n:1.29")

    testImplementation(kotlin("test"))
    testImplementation("org.assertj:assertj-core:3.27.7")
    testImplementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.22.3")
    testImplementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.22.3")
    testImplementation("com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.22.3")
}

publishing {
    publications.create<MavenPublication>("apiContract") {
        artifactId = "monitorfish-api-contract"
        from(components["java"])
    }
    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/MTES-MCT/monitorfish")
            credentials {
                username = System.getenv("GITHUB_ACTOR")
                password = System.getenv("GITHUB_TOKEN")
            }
        }
    }
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
