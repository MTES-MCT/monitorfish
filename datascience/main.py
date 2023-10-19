import prefect

from config import PREFECT_SERVER_URL
from src.pipeline.flows_config import flows_to_register

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


if __name__ == "__main__":
    # Initialize a client, which can interact with the Prefect orchestrator.
    # The communication with the orchestrator is done through the Prefect GraphQL API.
    print("Create client")
    client = prefect.Client(api_server=PREFECT_SERVER_URL)

    # Create the project "Monitorfish" in the orchestrator if it does not yet exist
    print("Create project")
    create_project_if_not_exists(client, PROJECT_NAME)

    # Register all flows
    print("Registering flows")
    for flow in flows_to_register:
        print(f"Registering flow {flow.name}")
        client.register(flow, project_name=PROJECT_NAME, no_url=True)
