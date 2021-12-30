import prefect
from prefect.agent.local import LocalAgent

from config import FLOWS_HEALTHCHECK_URL
from src.pipeline.schedules import flows_to_register

PROJECT_NAME = "Monitorfish"


def create_project_if_not_exists(client: prefect.Client, project_name: str) -> None:
    """Checks whether a project named "Monitorfish" already exists in Prefect Server.
    If not, the project is created.

    Args:
        client (prefect.Client): Prefect client instance

    Raises:
        ValueError: if more than 1 project with the name "Monitorfish" are found.
    """
    r = client.graphql('query{project(where: {name: {_eq : "Monitorfish"}}){name}}')
    projects = r["data"]["project"]
    if len(projects) == 0:
        print("Monitorfish project does not exists, it will be created.")
        client.create_project(project_name)
    elif len(projects) == 1:
        print("Monitorfish project already exists. Skipping project creation.")
    else:
        raise ValueError("Several projects with the name 'Monitorfish' were found.")


def register_flow(f: prefect.Flow, project_name: str) -> None:
    """Registers f to "Monitorfich" project.

    Args:
        f (prefect.Flow): Prefect flow
    """
    f.register(project_name)


if __name__ == "__main__":
    # Initialize a client, which can interact with the Prefect orchestrator.
    # The communication with the orchestrator is done through the Prefect GraphQL API.
    # This API is served on localhost:4200.
    print("Create client")
    client = prefect.Client()

    # Create the project "Monitorfish" in the orchestrator if it does not yet exist
    print("Create project")
    create_project_if_not_exists(client, PROJECT_NAME)

    # Register all flows
    print("Register flows")
    for f in flows_to_register:
        print(f"Register flow {f.name}")
        register_flow(f, PROJECT_NAME)

    # Start local "agent" process
    # This process queries the Prefect GraphQL API every second to ask if any new flows
    # should be run
    agent = LocalAgent(show_flow_logs=True, agent_address=FLOWS_HEALTHCHECK_URL)
    agent.start()
