# monitorfish-api-contract

Kotlin types of the MonitorFish public API (`/api/v1/...`), published so that consumers (e.g. RapportNav) stop
copying them.

| Endpoint                            | Type                                                                  |
|-------------------------------------|-----------------------------------------------------------------------|
| `GET /api/v1/mission_actions`       | `List<PublicMissionActionDataOutput>` (or `List<MissionActionDataOutput>`) |
| `PATCH /api/v1/mission_actions/{id}` | body `PatchableMissionActionDataInput`, response `PublicMissionActionDataOutput` |
| `GET /api/v1/vessels`               | `List<VesselIdentityDataOutput>`                                      |
| `GET /api/v1/ports`                 | `List<PortDataOutput>`                                                |

## Rules

- Only plain data classes and enums: no Spring, JPA or MonitorFish domain dependency. Dependencies are limited to
  `jackson-annotations` (read by both Jackson 2 and 3) and `nv-i18n` (`CountryCode`).
- The contract version is the MonitorFish release it was published from (`v1.127.0` → `1.127.0`).
- Changes must stay backward compatible: add nullable fields or fields with defaults, never rename or remove without
  a deprecation period. Consumers must deserialize with `FAIL_ON_UNKNOWN_PROPERTIES` disabled.
- Enum constants mirror the domain enums; `ContractEnumMapperUTests` fails if they diverge.

## Usage

```kotlin
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/MTES-MCT/monitorfish")
        credentials {
            username = System.getenv("GITHUB_ACTOR")
            password = System.getenv("GITHUB_TOKEN") // needs `read:packages`, even though the repository is public
        }
    }
}

dependencies {
    implementation("fr.gouv.cnsp:monitorfish-api-contract:1.127.0")
}
```

`PatchableMissionActionDataInput` fields are `Optional?`: `null` leaves the value untouched (the field is not sent),
`Optional.empty()` clears it. The Jackson `Jdk8Module` is required (built into Jackson 3).

## Publishing

`.github/workflows/publish-api-contract.yml` publishes on each GitHub release, or manually with a version.
Locally: `./gradlew :api-contract:publishToMavenLocal -PcontractVersion=0.0.1-local`.
