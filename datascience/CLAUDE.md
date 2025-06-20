# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MonitorFish is a **fisheries monitoring and control system** for the French Fisheries Monitoring Center. The datascience directory contains a **Prefect 1.x-based data pipeline** that processes vessel monitoring data, fishing activities, and regulatory compliance for real-time fisheries surveillance.

## Key Commands

### Development Setup
```bash
cd datascience
poetry install  # Install dependencies
```

### Testing
```bash
# Run all pipeline tests with coverage
cd datascience && poetry run coverage run -m pytest --pdb --ignore=tests/test_data/external tests/ && poetry run coverage report && poetry run coverage html

# Run tests with external data warehouse (full integration)
make test-pipeline-with-data_warehouse

# Run single test class (from root directory)
make test-pipeline class=<TestClassName>
```

### Code Quality
```bash
# Format and lint Python code
cd datascience && poetry run black .
cd datascience && poetry run isort .
cd datascience && poetry run flake8
```

### Data Pipeline Operations
```bash
# Register pipeline flows in production
make register-pipeline-flows-prod

# Register pipeline flows in staging
make register-pipeline-flows-int

# Install pipeline dependencies
make install-pipeline

# Start/stop data warehouse for testing
make run-data-warehouse
make stop-data-warehouse
```

### Documentation
```bash
# Build documentation locally
make build-docs-locally

# Push documentation to translation service
make push-docs-to-transifex
```

## Architecture Overview

### Pipeline Structure
- **src/pipeline/flows/**: 50+ Prefect flows for specific data processing tasks
- **src/pipeline/shared_tasks/**: Reusable task components
- **src/pipeline/helpers/**: Utility functions for data processing
- **src/pipeline/parsers/**: XML/data format parsers (ERS, FLUX)
- **src/pipeline/entities/**: Data models and entities

### Key Flow Categories
1. **Real-time Processing**: Position enrichment (every minute), alerts (every 10 minutes)
2. **Reference Data**: Administrative areas, vessels, ports, species, regulations
3. **Compliance Monitoring**: Missing reports, beacon malfunctions, fishing violations
4. **Analytics**: Risk factors, fleet segments, control statistics

### Database Connections
- **monitorfish_remote**: Main PostgreSQL database with PostGIS
- **monitorfish_local**: Local processing database  
- **Data Warehouse**: ClickHouse for analytics
- **External Sources**: OCAN (Oracle), FMC2 (Oracle), VMS API

### Core Data Sources
- **VMS Positions**: Real-time vessel tracking via API
- **ERS Logbook**: XML fishing activity declarations
- **Regulatory Data**: Fishing regulations and maritime boundaries
- **Vessel Registries**: From external Oracle databases

## Development Guidelines

### Flow Development (Prefect 1.x)
- Use `@task` decorator for individual tasks
- Use `with Flow()` context manager for flow definitions
- Use `executor=LocalDaskExecutor()` for parallel processing
- Use `get_run_logger()` for logging within tasks

### Database Operations
- Use `src.pipeline.generic_tasks.extract()` for SQL queries
- Use `src.pipeline.generic_tasks.load()` for data insertion
- Default to `replace_with_truncate=False` for data insertions
- Only use `replace_with_truncate=True` when explicitly required
- Use chunked processing for large datasets

### Testing
- Tests use pytest with docker-compose for database setup
- Mock external APIs and services in tests
- Use `.env.test` for test environment configuration
- Test data located in `tests/test_data/`

### Configuration
- Environment variables defined in `config.py`
- Flow scheduling configured in `flows_config.py`
- Database connections managed through `src.db_config.py`

## Common Patterns

### Typical Flow Structure (Prefect 1.x)
```python
from prefect import Flow, task, get_run_logger
from prefect.executors import LocalDaskExecutor
from src.pipeline.generic_tasks import extract, load

@task
def extract_data() -> pd.DataFrame:
    return extract("database_name", "path/to/query.sql")

@task  
def load_data(data: pd.DataFrame):
    logger = get_run_logger()
    load(
        data, 
        table_name="target_table", 
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        replace_with_truncate=False  # Default preference
    )

with Flow(
    "my_flow", 
    executor=LocalDaskExecutor()
) as flow:
    data = extract_data()
    load_data(data)
```

### SQL Query Location
- SQL queries stored in separate `.sql` files
- Referenced by relative path from flow files
- Use parameterized queries for dynamic values

### Scheduling Patterns
- High-frequency: Every minute for real-time data
- Medium-frequency: Every 10-30 minutes for alerts  
- Low-frequency: Daily/weekly for reference data
- Business hours only: `1,2,3,4,5` (weekdays) for some flows

## Important Notes

- This codebase uses **Prefect 1.x** (not Prefect 2.x or 3.x)
- This is a **production system** processing sensitive fishing surveillance data
- Many flows run on strict schedules for real-time monitoring
- Changes to core flows affect French maritime control operations
- Always test thoroughly with realistic data volumes
- Consider performance impact of database queries on production systems
- Prefer `replace_with_truncate=False` unless explicitly required for the use case