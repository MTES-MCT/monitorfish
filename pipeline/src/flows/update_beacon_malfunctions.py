from datetime import datetime
from typing import Callable, Tuple

import pandas as pd
from prefect import flow, task, unmapped

from config import (
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
)
from src.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionStage,
    BeaconStatus,
    EndOfMalfunctionReason,
)
from src.generic_tasks import extract
from src.processing import join_on_multiple_keys
from src.shared_tasks.beacon_malfunctions import (
    load_new_beacon_malfunctions,
    prepare_new_beacon_malfunctions,
    request_notification,
    update_beacon_malfunction,
)
from src.shared_tasks.control_flow import filter_results
from src.shared_tasks.dates import get_utcnow, make_timedelta
from src.shared_tasks.healthcheck import (
    assert_last_positions_flow_health,
    get_monitorfish_healthcheck,
)


@task
def extract_last_positions() -> pd.DataFrame:
    """
    Extract the last emission date of each vessel in the `last_positions` table.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/last_positions_for_beacon_malfunctions.sql",
    )


@task
def extract_known_malfunctions() -> pd.DataFrame:
    """
    Extract ongoing malfunctions in the `beacon_malfunctions` table.
    """
    return extract("monitorfish_remote", "monitorfish/known_beacon_malfunctions.sql")


@task
def extract_vessels_that_should_emit() -> pd.DataFrame:
    """
    Extract vessels from the `vessels` table that have a beacon associated to them
    with a status of `ACTIVATED` or `UNSUPERVISED` and with a flag_state that must be
    monitored.
    """
    return extract("monitorfish_remote", "monitorfish/vessels_that_should_emit.sql")


@task
def extract_satellite_operators_statuses() -> pd.DataFrame:
    """
    Extract satellite operators statuses from the `satellite_operators_statuses` view.
    This is intended to be used to filter which beacon malfunction to create and / or :
    when a satellite operator is down, we do not want to generate malfunctions for all
    the beacons of this operator, we want to wait until data flows are up again.
    """
    return extract("monitorfish_remote", "monitorfish/satellite_operators_statuses.sql")


@task
def get_last_emissions_of_vessels_that_should_emit(
    vessels_that_should_emit: pd.DataFrame, last_positions: pd.DataFrame
) -> pd.DataFrame:
    """
    Join `vessels_that_should_emit` and `last_positions` using `cfr`, `ircs` and
    `external_immatriculation` as join keys, using the `join_on_multiple_keys` logic.

    `last_positions` of a given vessel that were emitted before the vessel's beacon
    `logging_datetime_utc` are not taken into account : the result therefore only
    includes each vessel's last emission **with its current beacon**. Ths is done to
    avoid generating beacon malfunctions on a given vessel from emission data of its
    previous beacon.

    Args:
        vessels_that_should_emit (pd.DataFrame): DataFrame of vessels that should emit
        last_positions (pd.DataFrame): DataFrame of last positions

    Returns:
        pd.DataFrame: last emissions of the input vessels with their current beacon
    """
    last_emissions_of_vessels_that_should_emit = join_on_multiple_keys(
        vessels_that_should_emit,
        last_positions,
        or_join_keys=["cfr", "ircs", "external_immatriculation"],
        how="left",
        coalesce_common_columns=False,
    )

    last_emissions_of_vessels_that_should_emit = (
        last_emissions_of_vessels_that_should_emit.sort_values(
            "last_position_datetime_utc", ascending=False
        )
        .groupby("beacon_number")
        .head(1)
        .reset_index(drop=True)
    )

    last_emissions_of_vessels_that_should_emit[
        "last_position_datetime_utc"
    ] = last_emissions_of_vessels_that_should_emit.last_position_datetime_utc.where(
        last_emissions_of_vessels_that_should_emit.last_position_datetime_utc
        > last_emissions_of_vessels_that_should_emit.logging_datetime_utc
    )

    return last_emissions_of_vessels_that_should_emit


@task
def get_new_malfunctions(
    last_emissions: pd.DataFrame,
    known_malfunctions: pd.DataFrame,
    satellite_operators_statuses: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
    malfunction_datetime_utc_threshold_at_port: datetime,
) -> pd.DataFrame:
    operators_up = set(
        satellite_operators_statuses.loc[
            satellite_operators_statuses.operator_is_up == True, "satellite_operator_id"
        ].values
    )

    # Remove emissions of beacons already in malfunction
    last_emissions = last_emissions.loc[
        ~last_emissions.beacon_number.isin(known_malfunctions.beacon_number)
    ].copy(deep=True)

    # Remove emissions of beacons whose satellite operator is down
    last_emissions = last_emissions.loc[
        last_emissions.satellite_operator_id.isin(operators_up)
    ].copy(deep=True)

    new_malfunctions = (
        last_emissions.loc[
            (last_emissions.is_manual == True)
            | (
                (last_emissions.is_at_port == True)
                & (
                    last_emissions.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_port
                )
            )
            | (
                (last_emissions.is_at_port == False)
                & (
                    last_emissions.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_sea
                )
            )
        ]
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
        .reset_index(drop=True)
    )

    new_malfunctions = new_malfunctions.drop(
        columns=["is_manual", "satellite_operator_id"]
    )

    return new_malfunctions


@task
def get_ended_malfunction_ids(
    last_emissions_of_vessels_that_should_emit: pd.DataFrame,
    known_malfunctions: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
) -> Tuple[list, list, list]:
    ids_not_required_to_emit = set(
        known_malfunctions.loc[
            ~known_malfunctions.beacon_number.isin(
                last_emissions_of_vessels_that_should_emit.beacon_number
            ),
            "id",
        ]
    )

    known_malfunctions_last_emissions = pd.merge(
        known_malfunctions,
        last_emissions_of_vessels_that_should_emit,
        on="beacon_number",
        how="inner",
    )

    malfunctions_with_restarted_emissions = known_malfunctions_last_emissions.loc[
        (known_malfunctions_last_emissions.is_manual == False)
        & (
            known_malfunctions_last_emissions.last_position_datetime_utc
            >= malfunction_datetime_utc_threshold_at_sea
        )
    ].reset_index(drop=True)

    ids_unsupervised_restarted_emitting = set(
        malfunctions_with_restarted_emissions.loc[
            malfunctions_with_restarted_emissions.beacon_status
            != BeaconStatus.ACTIVATED.value,
            "id",
        ]
    )

    ids_restarted_emitting = set(
        malfunctions_with_restarted_emissions.loc[
            (
                malfunctions_with_restarted_emissions.beacon_status
                == BeaconStatus.ACTIVATED.value
            ),
            "id",
        ]
    )

    return (
        list(ids_restarted_emitting),
        list(ids_not_required_to_emit),
        list(ids_unsupervised_restarted_emitting),
    )


@flow(name="Monitorfish - Beacons malfunctions")
def update_beacon_malfunctions_flow(
    max_hours_without_emission_at_sea: int = BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
    max_hours_without_emission_at_port: int = BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    extract_satellite_operators_statuses_fn: Callable = extract_satellite_operators_statuses,
):
    # Healthcheck
    healthcheck = get_monitorfish_healthcheck()
    now = get_utcnow()
    assert_last_positions_flow_health(healthcheck=healthcheck, utcnow=now)

    # Extract
    last_positions = extract_last_positions.submit()
    vessels_that_should_emit = extract_vessels_that_should_emit.submit()
    known_malfunctions = extract_known_malfunctions.submit()

    satellite_operators_statuses = extract_satellite_operators_statuses_fn.submit()

    # Transform
    non_emission_at_sea_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_sea
    )
    non_emission_at_port_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_port
    )

    malfunction_datetime_utc_threshold_at_sea = now - non_emission_at_sea_max_duration
    malfunction_datetime_utc_threshold_at_port = now - non_emission_at_port_max_duration

    last_emissions_of_vessels_that_should_emit = (
        get_last_emissions_of_vessels_that_should_emit(
            vessels_that_should_emit, last_positions
        )
    )

    new_malfunctions = get_new_malfunctions(
        last_emissions_of_vessels_that_should_emit,
        known_malfunctions,
        satellite_operators_statuses,
        malfunction_datetime_utc_threshold_at_sea,
        malfunction_datetime_utc_threshold_at_port,
    )
    new_malfunctions = prepare_new_beacon_malfunctions(new_malfunctions)

    # Load
    load_new_beacon_malfunctions(new_malfunctions)

    (
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = get_ended_malfunction_ids(
        last_emissions_of_vessels_that_should_emit,
        known_malfunctions,
        malfunction_datetime_utc_threshold_at_sea,
    )

    ids_restarted_emitting_updated = update_beacon_malfunction.map(
        ids_restarted_emitting,
        new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
        end_of_malfunction_reason=unmapped(EndOfMalfunctionReason.RESUMED_TRANSMISSION),
    )

    ids_restarted_emitting_updated = filter_results(ids_restarted_emitting_updated)

    request_notification.map(
        ids_restarted_emitting_updated,
        unmapped(BeaconMalfunctionNotificationType.END_OF_MALFUNCTION),
    )

    # Malfunctions of unsupervised beacons are archived and automatically notified.
    ids_unsupervised_restarted_emitting_updated = update_beacon_malfunction.map(
        ids_unsupervised_restarted_emitting,
        new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
        end_of_malfunction_reason=unmapped(EndOfMalfunctionReason.RESUMED_TRANSMISSION),
    )

    ids_unsupervised_restarted_emitting_updated = filter_results(
        ids_unsupervised_restarted_emitting_updated
    )

    request_notification.map(
        ids_unsupervised_restarted_emitting_updated,
        unmapped(BeaconMalfunctionNotificationType.END_OF_MALFUNCTION),
    )

    # Malfunctions for which the beacon has been deactivated or completely
    # unequipped are just archived.
    update_beacon_malfunction.map(
        ids_not_required_to_emit,
        new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
        end_of_malfunction_reason=unmapped(
            EndOfMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED
        ),
    )

    return (
        new_malfunctions,
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    )
