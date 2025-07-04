import prefect

from src.deployments import deployments


def test_flows_registration():
    for flow in deployments:
        # Check that the flow and its params can be serialized and deserialized
        serialized_flow = flow.serialize()
        prefect.serialization.flow.FlowSchema().load(serialized_flow)

        # Check that the default parameters include all required parameters
        required_parameters = {p for p in flow.parameters() if p.required}
        if flow.schedule is not None and required_parameters:
            required_names = {p.name for p in required_parameters}
            for c in flow.schedule.clocks:
                try:
                    assert required_names <= set(c.parameter_defaults.keys())
                except AssertionError:
                    raise ValueError(
                        "Some of the flow's required parameters are missing from the "
                        "clock's default parameters :"
                        f"{required_names - set(c.parameter_defaults.keys())}"
                    )
