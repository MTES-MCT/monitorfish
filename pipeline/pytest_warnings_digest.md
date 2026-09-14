# Pipeline pytest warnings digest

Run: ~605 warnings (counted from the "warnings summary" section; pass/fail counts and timing
weren't captured this time). Python 3.14, pandas 2.x. Down from the previous 635 — the Prefect
runtime fix and the `zeros_ones_to_bools` rewrite (now returning nullable `"boolean"` dtype
instead of triggering silent-downcasting) removed several warnings.

Capture command:

```bash
cd pipeline && TEST=True poetry run pytest -W always -p no:cacheprovider \
  --ignore=tests/test_data/external -rw tests/
```

Full logs:
- `pytest_warnings.log` — complete run output
- `warnings_summary.txt` — just the pytest "warnings summary" section

---

## Your code (`src/`) — all pandas `FutureWarning`s

| Location | Warning |
|---|---|
| `src/processing.py:707`, `:711` | `pd.concat` with empty/all-NA entries |
| `src/processing.py:776` | Downcasting in `.fillna(False)` |
| `src/flows/control_anteriority.py:415` | Downcasting in `.fillna({"seizure_and_diversion": False})` |
| `src/flows/distribute_pnos.py:241`, `:265` | `.agg` passing builtin `sum` instead of `"sum"` |
| `src/flows/enrich_logbook.py:537` | Downcasting in `.fillna(False)` |
| `src/flows/enrich_positions.py:116` | `GroupBy.apply` operating on grouping columns (needs `include_groups=False`) |
| `src/flows/missing_far_alerts.py:263` | `pd.concat` with empty/all-NA entries |
| `src/flows/position_alert.py:131` | SQLAlchemy `and_()` with no args deprecated — `and_(*filter_conditions)` when empty |
| `src/flows/vessels.py:152` | Downcasting in `.fillna({"under_charter": False})` |
| `src/flows/vessels.py:302` | Setting incompatible dtype into a `category` column — `res.loc[:, col_name] = coalesce(...)` |

Recurring theme: pandas 2.x silent-downcasting removal. A global
`pd.set_option("future.no_silent_downcasting", True)` + explicit casts would clear most of them.

Fixed since last digest: `src/processing.py:306` (`replace()` downcasting) and
`src/flows/vessels.py:307` (`.fillna(False)` downcasting) were cleared by the
`zeros_ones_to_bools` rewrite, which now returns the nullable `"boolean"` dtype instead of
`object`/`float`. `src/flows/controls.py:245/251/252` still call `.fillna(False)` but no longer
warn, for the same reason — their input is now already boolean-typed upstream.

---

## Test code (`tests/`) — mostly `assert_frame_equal` nan/None mismatches

`test_flows/test_current_segments.py:467`, `test_flows/test_init_segments_2025.py:40`,
`test_flows/test_regulations.py:102`, `test_flows/test_risk_factors.py:1043`,
`test_helpers/test_segments.py:46`, `:60`, `test_parsers/test_flux.py:1024`.

Plus two `pd.concat` empty/all-NA warnings in test fixture setup —
`test_flows/test_email_actions_to_units.py:232`, `test_flows/test_enrich_positions.py:384` —
and one downcasting warning building test fixtures at `test_processing.py:581`
(`.fillna("null")`).

`test_flows/test_beacons.py:115` no longer warns (was in the previous digest).

---

## Third-party (not actionable here)

- `coolname/loader.py:64`, `:74` — `codecs.open()` deprecated (16×)
- `pydantic/main.py:1828` — field name `schema` shadows attribute in the
  `Refresh_Materialized_View_FlowModel` flow model (this one you *could* fix by renaming the
  param)
- `pypdf/_page.py:1641` — `replace_contents()` deprecation
- `pyogrio` (`raw.py:200`, `geopandas.py:948`, `core.py:169`) — GPKG file-extension /
  missing-CRS / unsupported-open-option runtime warnings
- `pandas/core/internals/concat.py:510` — NumPy timedelta "generic" unit
- `<frozen importlib._bootstrap>:491` — `'u'` type code removed in Python 3.16
- `typer/__init__.py:24`, `:25` — `click.utils.get_binary_stream`/`get_text_stream` deprecated
  in Click 9.0 (new since last digest)

Fixed since last digest: `prefect/client/schemas/objects.py:764/767` — cleared by the Prefect
runtime repair (`ed2de2b21`, `439256b72`).
