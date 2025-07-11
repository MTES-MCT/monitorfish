FROM python:3.13.5-slim-bullseye AS base

ENV VIRTUAL_ENV="/opt/venv" \
    # paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv" \
    ORACLE_INSTANT_CLIENT_LOCATION="/opt/oracle_instant_client"

ENV PATH="$VENV_PATH/bin:$PATH"

RUN apt-get update && apt-get install -y \
    # libpq-dev is required both for compiling and for running psycopg2
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

#######################################################################################
###############################       BUILDER        ##################################
#######################################################################################
FROM base AS builder

    # poetry
    # https://python-poetry.org/docs/configuration/#using-environment-variables
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR="/tmp/poetry_cache" \
    POETRY_VERSION="1.6.1" \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry"

ENV PATH="$POETRY_HOME/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Compilation of psycopg2 requires a C compiler
    build-essential \
    # To convert the Oracle Instant Client .rpm file into a .deb file
    alien \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR $ORACLE_INSTANT_CLIENT_LOCATION

# Download Oracle Instant Client .rpm and convert it to .deb file
RUN wget \
https://download.oracle.com/otn_software/linux/instantclient/\
19800/oracle-instantclient19.8-basic-19.8.0.0.0-1.x86_64.rpm \
&& alien --scripts oracle-instantclient19.8-basic-19.8.0.0.0-1.x86_64.rpm \
&& rm oracle-instantclient19.8-basic-19.8.0.0.0-1.x86_64.rpm

WORKDIR $PYSETUP_PATH

# install poetry - respects $POETRY_VERSION & $POETRY_HOME
RUN curl -sSL https://install.python-poetry.org | python3 -

# Install python dependencies
COPY pipeline/poetry.lock pipeline/pyproject.toml ./
RUN --mount=type=cache,target=$POETRY_CACHE_DIR poetry install --without dev --no-root

#######################################################################################
###############################       RUNTIME        ##################################
#######################################################################################
FROM base AS runtime

ENV TINI_VERSION="v0.19.0" \
    USER="monitorfish-pipeline"

WORKDIR $ORACLE_INSTANT_CLIENT_LOCATION
COPY --from=builder $ORACLE_INSTANT_CLIENT_LOCATION $ORACLE_INSTANT_CLIENT_LOCATION
RUN dpkg -i oracle-instantclient19.8-basic_19.8.0.0.0-2_amd64.deb

RUN apt-get update && apt-get install -y \
    # pango is required by weasyprint
    pango1.0-tools \
    # libaio1 is required by Oracle Instant Client
    libaio1 \
    && rm -rf /var/lib/apt/lists/*

# copy in our built venv
COPY --from=builder $PYSETUP_PATH $PYSETUP_PATH

# Add source
WORKDIR /home/${USER}/
COPY pipeline/ ./pipeline

# Make library importable
ENV PYTHONPATH=/home/${USER}/pipeline

# Add migration files for tests
COPY backend/src/main/resources/db/migration  ./backend/src/main/resources/db/migration

# Add `tini` init
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# Create non root user
RUN useradd -m -r ${USER} && \
    chown ${USER} /home/${USER}
WORKDIR /home/${USER}
RUN mkdir /home/${USER}/.prefect/

RUN chown -R ${USER} .
USER ${USER}
WORKDIR /home/${USER}/pipeline
ENTRYPOINT ["/tini", "--"]
CMD ["python", "main.py"]