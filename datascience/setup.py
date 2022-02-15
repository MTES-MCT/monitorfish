from setuptools import find_packages, setup

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="src",
    version="1.0",
    package_dir={"": "."},
    packages=find_packages(exclude=["tests", "tests.*"]),
    install_requires=requirements,
)
