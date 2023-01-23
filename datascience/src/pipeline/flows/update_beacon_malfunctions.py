from datetime import datetime
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, case, task, unmapped
from prefect.executors import LocalDaskExecutor

from config import (
    BEACON_MALFUNCTIONS_ENDPOINT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
)
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    BeaconStatus,
    EndOfMalfunctionReason,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import join_on_multiple_keys
from src.pipeline.shared_tasks.control_flow import (
    check_flow_not_running,
    filter_results,
)
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta
from src.pipeline.shared_tasks.healthcheck import (
  assert_last_positions_flow_health,
  get_monitorfish_healthcheck,
)


@task(checkpoint=False)
def extract_last_positions() -> pd.DataFrame:
    """
    Extract the last emission date of each vessel in the `last_positions` table for
    certain flag states.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/last_positions_for_beacon_malfunctions.sql",
    )


@task(checkpoint=False)
def extract_known_malfunctions() -> pd.DataFrame:
    """
    Extract ongoing malfunctions in the `beacon_malfunctions` table.
    """
    return extract("monitorfish_remote", "monitorfish/known_beacon_malfunctions.sql")


@task(checkpoint=False)
def extract_vessels_that_should_emit() -> pd.DataFrame:
    """
    Extract vessels from the `vessels` table that have a beacon associated to them
    with a status of `ACTIVATED` or `UNSUPERVISED` and with a flag_state that must be
    monitored.
    """
    return extract("monitorfish_remote", "monitorfish/vessels_that_should_emit.sql")


@task(checkpoint=False)
def extract_satellite_operators_statuses() -> pd.DataFrame:
    """
    Extract satellite operators statuses from the `satellite_operators_statuses` view.
    This is intended to be used to filter which beacon malfunction to create and / or :
    when a satellite operator is down, we do not want to generate malfunctions for all
    the beacons of this operator, we want to wait until data flows are up again.
    """
    return extract("monitorfish_remote", "monitorfish/satellite_operators_statuses.sql")


@task(checkpoint=False)
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


@task(checkpoint=False)
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


@task(checkpoint=False)
def get_ended_malfunction_ids(
    last_emissions_of_vessels_that_should_emit: pd.DataFrame,
    known_malfunctions: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
) -> Tuple[list, list, list, list]:

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
        & (known_malfunctions_last_emissions.is_at_port == False)
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

    ids_at_port_restarted_emitting = set(
        malfunctions_with_restarted_emissions.loc[
            (
                malfunctions_with_restarted_emissions.beacon_status
                == BeaconStatus.ACTIVATED.value
            )
            & (
                malfunctions_with_restarted_emissions.vessel_status
                == BeaconMalfunctionVesselStatus.AT_PORT.value
            ),
            "id",
        ]
    )

    ids_not_at_port_restarted_emitting = set(
        malfunctions_with_restarted_emissions.loc[
            (
                malfunctions_with_restarted_emissions.beacon_status
                == BeaconStatus.ACTIVATED.value
            )
            & (
                malfunctions_with_restarted_emissions.vessel_status
                != BeaconMalfunctionVesselStatus.AT_PORT.value
            ),
            "id",
        ]
    )

    return (
        list(ids_not_at_port_restarted_emitting),
        list(ids_at_port_restarted_emitting),
        list(ids_not_required_to_emit),
        list(ids_unsupervised_restarted_emitting),
    )


@task(checkpoint=False)
def prepare_new_beacon_malfunctions(new_malfunctions: pd.DataFrame) -> pd.DataFrame:
    new_malfunctions["vessel_status"] = np.choose(
        new_malfunctions.is_at_port.astype(int),
        [
            BeaconMalfunctionVesselStatus.AT_SEA.value,
            BeaconMalfunctionVesselStatus.AT_PORT.value,
        ],
    )

    new_malfunctions["stage"] = BeaconMalfunctionStage.INITIAL_ENCOUNTER.value

    new_malfunctions["malfunction_end_date_utc"] = pd.NaT
    new_malfunctions["vessel_status_last_modification_date_utc"] = datetime.utcnow()

    notification_to_send = {
        BeaconMalfunctionVesselStatus.AT_SEA.value: (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value
        ),
        BeaconMalfunctionVesselStatus.AT_PORT.value: (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value
        ),
    }

    new_malfunctions["notification_requested"] = new_malfunctions.vessel_status.map(
        lambda x: notification_to_send[x]
    )

    new_malfunctions[
        "notification_requested"
    ] = new_malfunctions.notification_requested.where(
        new_malfunctions.beacon_status == BeaconStatus.ACTIVATED.value, None
    )

    new_malfunctions = new_malfunctions.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
            "beacon_status": "beacon_status_at_malfunction_creation",
        }
    )

    ordered_columns = [
        "internal_reference_number",
        "external_reference_number",
        "ircs",
        "vessel_name",
        "flag_state",
        "vessel_identifier",
        "vessel_status",
        "stage",
        "malfunction_start_date_utc",
        "malfunction_end_date_utc",
        "vessel_status_last_modification_date_utc",
        "vessel_id",
        "notification_requested",
        "latitude",
        "longitude",
        "beacon_number",
        "beacon_status_at_malfunction_creation",
    ]
    return new_malfunctions.loc[:, ordered_columns]


@task(checkpoint=False)
def load_new_beacon_malfunctions(new_beacon_malfunctions: pd.DataFrame):
    load(
        new_beacon_malfunctions,
        table_name="beacon_malfunctions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="append",
    )


@task(checkpoint=False)
def update_beacon_malfunction(
    beacon_malfunction_id: int,
    *,
    new_stage: BeaconMalfunctionStage = None,
    new_vessel_status: BeaconMalfunctionVesselStatus = None,
    end_of_malfunction_reason: EndOfMalfunctionReason = None,
):
    """Update a `beacon_malfunction` stage or vessel status.

    - Exactly one of `new_state` or `new_vessel_status` must be provided
    - `end_of_malfunction_reason` must be provided if `new_stage` is provided and is
      equal to `END_OF_MALFUNCTION`
    - `end_of_malfunction_reason` cannot be be provided when `new_vessel_status` is
      provided

    Args:
        beacon_malfunction_id (int): id of the beacon_malfunction to update
        new_stage (beaconMalfunctionStage, optional): stage to move the beacon
          malfunction to. Defaults to None.
        new_vessel_status (beaconMalfunctionVesselStatus, optional): vessel_status to
          move the beacon malfunction to. Defaults to None.
        end_of_malfunction_reason (endOfMalfunctionReason, optional): reason that led
          to the end of the malfunction. Defaults to None.

    Raises:
        ValueError: in the following cases :

          - both `new_stage` and `new_vessel_status` are provided
          - both `new_stage` and `new_vessel_status` are null
          - `new_stage` is `END_OF_MALFUNCTION` and no `end_of_malfunction_reason` is
            provided
          - an `end_of_malfunction_reason` is provided along with a `new_vessel_status`
    """

    try:
        assert (
            new_stage is None
            and isinstance(new_vessel_status, BeaconMalfunctionVesselStatus)
        ) or (
            new_vessel_status is None and isinstance(new_stage, BeaconMalfunctionStage)
        )
    except AssertionError:
        raise ValueError(
            "Exactly one of new_stage or new_vessel_status must be provided"
        )

    url = BEACON_MALFUNCTIONS_ENDPOINT + str(beacon_malfunction_id)
    json = {}

    if new_stage:
        json["stage"] = new_stage.value

        if new_stage is BeaconMalfunctionStage.END_OF_MALFUNCTION:
            try:
                assert isinstance(end_of_malfunction_reason, EndOfMalfunctionReason)
            except AssertionError:
                raise ValueError(
                    (
                        "Cannot end a malfunction without "
                        "giving an end_of_malfunction_reason"
                    )
                )

        if end_of_malfunction_reason:
            assert isinstance(end_of_malfunction_reason, EndOfMalfunctionReason)
            try:
                assert new_stage in (
                    BeaconMalfunctionStage.END_OF_MALFUNCTION,
                    BeaconMalfunctionStage.ARCHIVED,
                )
            except AssertionError:
                raise ValueError(
                    (
                        "Cannot give a `EndOfBeaconMalfunctionReason` for a new_stage "
                        "other than `END_OF_MALFUNCTION`  or `ARCHIVED`."
                    )
                )

            json["endOfBeaconMalfunctionReason"] = end_of_malfunction_reason.value

    if new_vessel_status:
        try:
            assert end_of_malfunction_reason is None
        except AssertionError:
            raise ValueError(
                (
                    "Unexpected argument end_of_malfunction_reason "
                    "when updating vessel_status"
                )
            )
        json["vesselStatus"] = new_vessel_status.value

    if json:
        headers = {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        }
        r = requests.put(url=url, json=json, headers=headers)
        r.raise_for_status()

    return beacon_malfunction_id


@task(checkpoint=False)
def request_notification(
    beacon_malfunction_id: int,
    requested_notification: BeaconMalfunctionNotificationType,
):
    try:
        assert isinstance(requested_notification, BeaconMalfunctionNotificationType)
    except AssertionError:
        raise ValueError(
            (
                "Expected BeaconMalfunctionNotificationType, "
                f"got {requested_notification} instead."
            )
        )

    url = (
        BEACON_MALFUNCTIONS_ENDPOINT
        + f"{str(beacon_malfunction_id)}/{requested_notification.value}"
    )
    r = requests.put(url)
    r.raise_for_status()


with Flow("Beacons malfunctions", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Healthcheck
        healthcheck = get_monitorfish_healthcheck()
        now = get_utcnow()
        last_positions_healthcheck = assert_last_positions_flow_health(
            healthcheck=healthcheck, utcnow=now
        )

        # Parameters
        max_hours_without_emission_at_sea = Parameter(
            "max_hours_without_emission_at_sea",
            default=BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
        )
        max_hours_without_emission_at_port = Parameter(
            "max_hours_without_emission_at_port",
            default=BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
        )

        # Extract
        last_positions = extract_last_positions(
            upstream_tasks=[last_positions_healthcheck]
        )
        vessels_that_should_emit = extract_vessels_that_should_emit(
            upstream_tasks=[last_positions_healthcheck]
        )
        known_malfunctions = extract_known_malfunctions(
            upstream_tasks=[last_positions_healthcheck]
        )

        satellite_operators_statuses = extract_satellite_operators_statuses()

        # Transform
        non_emission_at_sea_max_duration = make_timedelta(
            hours=max_hours_without_emission_at_sea
        )
        non_emission_at_port_max_duration = make_timedelta(
            hours=max_hours_without_emission_at_port
        )

        malfunction_datetime_utc_threshold_at_sea = (
            now - non_emission_at_sea_max_duration
        )
        malfunction_datetime_utc_threshold_at_port = (
            now - non_emission_at_port_max_duration
        )

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
            ids_not_at_port_restarted_emitting,
            ids_at_port_restarted_emitting,
            ids_not_required_to_emit,
            ids_unsupervised_restarted_emitting,
        ) = get_ended_malfunction_ids(
            last_emissions_of_vessels_that_should_emit,
            known_malfunctions,
            malfunction_datetime_utc_threshold_at_sea,
        )

        # Malfunctions not "at port" (or supposed not to be, according to the latest
        # vessel_status of the malfunction) - that is, in a status of AT_SEA,
        # ACTIVITY_DETECTED... anything by AT_PORT - are moved to END_OF_MALFUNCTION.
        # Notification is left to be done manually after a human check.
        update_beacon_malfunction.map(
            ids_not_at_port_restarted_emitting,
            new_stage=unmapped(BeaconMalfunctionStage.END_OF_MALFUNCTION),
            end_of_malfunction_reason=unmapped(
                EndOfMalfunctionReason.RESUMED_TRANSMISSION
            ),
        )

        # Malfunctions "at port" (or supposed to be, according to the latest vessel_status
        # of the malfunction) are moved to ARCHIVED and automatically notified.
        ids_at_port_restarted_emitting_updated = update_beacon_malfunction.map(
            ids_at_port_restarted_emitting,
            new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
            end_of_malfunction_reason=unmapped(
                EndOfMalfunctionReason.RESUMED_TRANSMISSION
            ),
        )

        ids_at_port_restarted_emitting_updated = filter_results(
            ids_at_port_restarted_emitting_updated
        )

        request_notification.map(
            ids_at_port_restarted_emitting_updated,
            unmapped(BeaconMalfunctionNotificationType.END_OF_MALFUNCTION),
        )

        # Malfunctions for which the beacon is unsupervised, has been deactivated or
        # completely unequipped are just archived.
        update_beacon_malfunction.map(
            ids_not_required_to_emit,
            new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
            end_of_malfunction_reason=unmapped(
                EndOfMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED
            ),
        )

        update_beacon_malfunction.map(
            ids_unsupervised_restarted_emitting,
            new_stage=unmapped(BeaconMalfunctionStage.ARCHIVED),
            end_of_malfunction_reason=unmapped(
                EndOfMalfunctionReason.RESUMED_TRANSMISSION
            ),
        )

flow.file_name = Path(__file__).name
