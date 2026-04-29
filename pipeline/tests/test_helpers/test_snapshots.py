import os

def should_generate_snapshots() -> bool:
    val = os.getenv("TEST_GENERATE_SNAPSHOTS")
    if val is None:
        return False
    return val.lower() == "true"