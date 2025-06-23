# from docker.types import Mount
# from dotenv import dotenv_values
# from prefect.run_configs.docker import DockerRun
# from prefect.schedules import CronSchedule, Schedule, clocks
# from prefect.storage.local import Local

################################ Define flow schedules ################################


###################### List flows to register with prefect server #####################
flows_to_register = []


################################ Define flows' storage ################################
# This defines where the executor can find the flow.py file for each flow **inside**
# the container.
for flow in flows_to_register:
    pass
    # flow.storage = Local(
    #     add_default_labels=False,
    #     stored_as_script=True,
    #     path=(FLOWS_LOCATION / flow.file_name).as_posix(),
    # )

################### Define flows' run config ####################
for flow in flows_to_register:
    pass
    # if flow.name == logbook.flow.name:
    #     host_config = {
    #         "group_add": [LOGBOOK_FILES_GID],
    #         "mounts": [
    #             Mount(
    #                 target="/opt2/monitorfish-data/ers",
    #                 source="/opt2/monitorfish-data/ers",
    #                 type="bind",
    #             )
    #         ],
    #     }

    # elif flow.name in (init_pno_subscriptions.flow.name,):
    #     host_config = {
    #         "mounts": [
    #             Mount(
    #                 target=NON_COMMITED_DATA_LOCATION.as_posix(),
    #                 source="/opt/pipeline-data",
    #                 type="bind",
    #             )
    #         ],
    #     }

    # else:
    #     host_config = None

    # flow.run_config = DockerRun(
    #     image=f"{DOCKER_IMAGE}:{MONITORFISH_VERSION}",
    #     host_config=host_config,
    #     env=dotenv_values(ROOT_DIRECTORY / ".env"),
    #     labels=[FLOWS_LABEL],
    # )
