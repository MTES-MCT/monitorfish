import logging

import sentry_sdk
from prefect import Flow
from prefect.client.schemas.objects import FlowRun
from prefect.logging.loggers import flow_run_logger
from prefect.states import State
from sentry_sdk.integrations.logging import LoggingIntegration

from config import PROXIES, SENTRY_DSN, SENTRY_ENV

# Where the SDK logs the events it fails to send (network error, rejected by Sentry
# or by the proxy...), as sending happens in a background thread and never raises.
# The SDK drops these logs unless it is initialized with `debug=True`.
sentry_sdk_logger = logging.getLogger("sentry_sdk.errors")


class _CollectRecordsHandler(logging.Handler):
    def __init__(self):
        super().__init__(level=logging.WARNING)
        self.records: list[logging.LogRecord] = []

    def emit(self, record: logging.LogRecord):
        self.records.append(record)


def report_flow_failure_to_sentry(flow: Flow, flow_run: FlowRun, state: State):
    """
    Prefect `on_failure` / `on_crashed` hook creating a Sentry issue for the flow run.
    Does nothing when no Sentry DSN is configured.
    """
    if not SENTRY_DSN:
        return

    logger = flow_run_logger(flow_run, flow)
    sentry_sdk_errors_handler = _CollectRecordsHandler()
    sentry_sdk_logger.addHandler(sentry_sdk_errors_handler)

    # A Sentry outage must not change the outcome of the flow run
    try:
        if not sentry_sdk.is_initialized():
            sentry_sdk.init(
                dsn=SENTRY_DSN,
                environment=SENTRY_ENV,
                http_proxy=PROXIES["http"],
                https_proxy=PROXIES["https"],
                debug=True,
                # Failures are reported by this hook only, with the flow run context,
                # not a second time from Prefect's error logs
                integrations=[LoggingIntegration(event_level=None)],
            )

        exception = state.result(raise_on_failure=False)

        with sentry_sdk.new_scope() as scope:
            scope.set_tag("flow_name", flow.name)
            scope.set_tag("flow_run_name", flow_run.name)
            scope.set_tag("deployment_id", str(flow_run.deployment_id))
            scope.set_tag("state_type", state.type.value)
            scope.set_context(
                "flow_run",
                {
                    "id": str(flow_run.id),
                    "parameters": flow_run.parameters,
                    "state_message": state.message,
                },
            )
            # Without it, all flows' failures would be grouped together on the
            # Prefect engine frames that are common to all their stack traces
            scope.fingerprint = [
                "pipeline-flow",
                flow.name,
                type(exception).__name__,
            ]

            if isinstance(exception, BaseException):
                sentry_sdk.capture_exception(exception)
            else:
                sentry_sdk.capture_message(
                    f"{flow.name} - {state.message}", level="error"
                )

        # Flow runs execute in containers which are removed once the run is over
        sentry_sdk.flush(timeout=5)
    except Exception:
        logger.warning(
            "Could not report the flow run failure to Sentry.", exc_info=True
        )
    finally:
        sentry_sdk_logger.removeHandler(sentry_sdk_errors_handler)

    # Logged from this thread, as Prefect drops the logs emitted outside of a run
    # context, like those of the SDK's background thread
    for record in sentry_sdk_errors_handler.records:
        logger.log(
            record.levelno, f"Sentry: {record.getMessage()}", exc_info=record.exc_info
        )
