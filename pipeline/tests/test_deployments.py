import inspect
from typing import List

from prefect import Flow
from prefect.schedules import Schedule

from src.deployments import flows_to_deploy


def validate_schedule_parameters(
    flow_function: Flow, schedules: List[Schedule] = None
) -> None:
    """
    Validates that all scheduled runs have parameters matching the flow's signature.

    Args:
        flow_function: The flow function to validate against
        schedules: List of schedule configurations with parameters

    Raises:
        ValueError: If any schedule parameters don't match the flow signature
    """
    flow_params = inspect.signature(flow_function).parameters

    if schedules is None:
        schedules = []

    for schedule in schedules:
        schedule_params = schedule.parameters

        for name, param in flow_params.items():
            if param.default == inspect.Parameter.empty and name not in schedule_params:
                raise ValueError(
                    f"Schedule is missing required parameter '{name}' "
                    f"for flow '{flow_function.__name__}'"
                )

        for param_name, schedule_param in schedule_params.items():
            if param_name not in flow_params:
                raise ValueError(
                    f"Schedule contains unknown parameter '{param_name}' "
                    f"for flow '{flow_function.__name__}'"
                )
            flow_param = flow_params.get(param_name)
            assert isinstance(schedule_param, flow_param.annotation)


def test_deployments():
    for flow_to_deploy in flows_to_deploy:
        validate_schedule_parameters(flow_to_deploy.flow, flow_to_deploy.schedules)
