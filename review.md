# Code review — `vincent/priority_groups`

### 🔴 Bug — Feature broken in frontend: `HARDCODED` group type not handled

**`frontend/src/features/VesselGroup/types.ts` line 33**

The frontend `GroupType` enum only declares `DYNAMIC` and `FIXED`. The backend now emits `type: "HARDCODED"` for `PriorityVesselGroup`, which fails both Zod union branches in `apis.ts` (each uses `z.literal()` on its own type). `parseOrReturn` catches the error and falls back to returning untyped data, so priority groups pass through the wire but every downstream `switch`/render on `GroupType` silently ignores them. Priority groups will never appear in the UI.

Fix: add `HARDCODED = 'HARDCODED'` to `GroupType`, add a `PriorityVesselGroupSchema`, and extend the union in `apis.ts`.

---

### 🔴 Bug — Feature broken in map view: `GetActiveVessels` still calls the repository directly

**`backend/.../vessel/GetActiveVessels.kt` line 47**

`GetActiveVessels` calls `vesselGroupRepository.findAllByUserAndSharing()` directly, not `GetAllVesselGroups.execute()`. The repository never returns `PriorityVesselGroup` instances (they are in-memory constants, not persisted). The `is PriorityVesselGroup` branch added to the `when` at line 98 can therefore never be reached. Vessels displayed on the map panel are never tagged with a priority group, even though `GetVessel` (the detail panel) now correctly tags them — the two endpoints are inconsistent.

Fix: inject `GetAllVesselGroups` into `GetActiveVessels` and call it instead of the repository directly, following the same pattern applied to `GetVessel` and `GetAllVesselGroupsWithVessels` in this PR.

---

### 🟠 Bug — `containsActiveVessel` uses `toInt()` (truncation) to match a `Double` priority level

**`backend/.../vessel_group/VesselGroup.kt` line 167**

```kotlin
activeVessel.riskFactor.effectiveControlPriorityLevel.toInt() == priorityLevel
```

The `control_priority_level` columns in the `risk_factors` table are `DOUBLE PRECISION` with no integer constraint. Pipeline test data shows fractional values in practice (e.g. `2.9`, `3.5`). `toInt()` truncates toward zero: a vessel with `effectiveControlPriorityLevel = 3.9` becomes `3`, matching P2 (`priorityLevel = 3`) instead of no group. A vessel at `4.9` matches P1. If the pipeline intends only integer-valued levels, this works today but is fragile. If not, it silently produces wrong group membership.

Fix: use `roundToInt()`, or add an explicit assertion that the value is integral, or store priority levels as `Int` in the domain model.

---

### 🟠 Bug (plausible) — `effectiveControlPriorityLevel` guards first branch on `segmentHighestImpact` instead of `segmentHighestPriority`

**`backend/.../risk_factor/VesselRiskFactor.kt` line 77**

```kotlin
when {
    segmentHighestImpact != null         -> controlPriorityLevel
    recentSegmentHighestPriority != null -> recentControlPriorityLevel
    usualSegmentHighestPriority != null  -> usualSegmentsControlPriorityLevel
    else -> 1.0
}
```

Branches 2 and 3 gate on `*HighestPriority` fields; branch 1 gates on `segmentHighestImpact` (a different, independently-set field). `segmentHighestPriority` exists in the entity and is mapped from the DB, but is never used here. A vessel that has a current segment with an impact score but no control-priority ranking will have `segmentHighestImpact != null` while `segmentHighestPriority == null`, causing `controlPriorityLevel` (which may be a default) to be used as the effective priority level.

Fix: confirm intent with the pipeline team; if branch 1 should mean "vessel has a segment with a priority ranking", the guard should be `segmentHighestPriority != null`.

---

### 🟡 Maintainability — `else -> 1.0` should reference `defaultControlPriorityLevel`

**`backend/.../risk_factor/VesselRiskFactor.kt` line 80**

The `effectiveControlPriorityLevel` fallback hardcodes the literal `1.0` instead of the constant `defaultControlPriorityLevel` already defined at line 19. If `defaultControlPriorityLevel` is ever updated (it mirrors a Python pipeline constant), the `else` branch silently diverges and vessels with no segment data get a different effective priority than the rest of the system expects.

Fix: `else -> defaultControlPriorityLevel`.

---

### 🟡 Maintainability — `when` branches in `GetAllVesselGroupsWithVessels` lose sealed-class exhaustiveness

**`backend/.../vessel_groups/GetAllVesselGroupsWithVessels.kt` lines 46 and 58**

The inner `when` (vessel matching) uses `else -> false` and the outer `when` (result building) uses `else -> (groupToVessels[group] ?: emptyList())`. Both lose Kotlin's sealed-class exhaustiveness guarantee. `nonFixedGroups` already excludes `FixedVesselGroup`, so the `else -> false` branch is dead code today. If a new `VesselGroupBase` subtype is added that is not `FixedVesselGroup`, it will silently receive an empty vessel list with no compile-time warning.

Fix: write both `when` expressions exhaustively over the sealed type without `else`:

```kotlin
// inner
when (group) {
    is PriorityVesselGroup -> group.containsActiveVessel(activeVessel)
    is DynamicVesselGroup  -> group.containsActiveVessel(activeVessel, now)
    is FixedVesselGroup    -> false  // excluded from nonFixedGroups, never reached
}

// outer
when (group) {
    is FixedVesselGroup -> getVesselsFromReferential(...)
    is PriorityVesselGroup, is DynamicVesselGroup ->
        (groupToVessels[group] ?: emptyList()).mapIndexed { i, v -> Pair(i, v) }
}
```

---

### 🟡 Efficiency — Identifier lookup maps built unconditionally even when there are no `FixedVesselGroup`s

**`backend/.../vessel_groups/GetAllVesselGroupsWithVessels.kt` line 32**

Building `byVesselId`, `byCfr`, `byIrcs`, `byExternalId` requires a full iteration over all active vessels. Since this PR unconditionally prepends `PriorityVesselGroup.PRIORITY_GROUPS`, users who have only priority and dynamic groups — the common case — pay this O(N) cost on every request for four maps that are never queried.

Fix:

```kotlin
val hasFixedGroups = allGroups.any { it is FixedVesselGroup }
if (hasFixedGroups) {
    activeVessels.forEach { buildMapOfIdentifiers(it, byVesselId, byCfr, byIrcs, byExternalId) }
}
```

---

### 🔵 Cleanup — `PriorityVesselGroupDataOutput` duplicates 14 of 15 fields from the other two group DTOs

**`backend/.../outputs/PriorityVesselGroupDataOutput.kt` line 9**

The new DTO is a verbatim copy of the shared header fields already present in `DynamicVesselGroupDataOutput` and `FixedVesselGroupDataOutput` (id, name, isDeleted, description, pointsOfAttention, color, sharing, sharedTo, type, createdBy, createdAtUtc, updatedAtUtc, endOfValidityUtc, startOfValidityUtc). Every future header field (e.g. `updatedBy`, `tags`) must be added to all three DTOs separately; one will inevitably be missed.

Fix: extract a `VesselGroupBaseDataOutput` with the 14 shared fields, and have each concrete DTO either extend it or compose it, adding only the type-specific field (`filters`, `vessels`, or `priorityLevel`).
