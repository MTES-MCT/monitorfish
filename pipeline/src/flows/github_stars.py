from time import sleep

from prefect import flow, task

from config import MONITORFISH_SMS_DOMAIN


@task(log_prints=True)
def get_stars(repo: str):
    url = f"https://api.github.com/repos/{repo}"
    count = 10
    print(f"{url} has {count} stars!")
    print(f"MONITORFISH_SMS_DOMAIN: {MONITORFISH_SMS_DOMAIN}")
    for i in range(10):
        print(f"Sleeping for 10s... {i} / 10")
        sleep(10)
    return count


@flow()
def github_stars_flow(repos: list[str]):
    stars = 0
    for repo in repos:
        stars += get_stars(repo)
    return stars
