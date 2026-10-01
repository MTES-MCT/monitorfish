=======================
Activity visualizations
=======================

The ``Activity visualizations`` flow extracts one year of aggregated declarative data from the Data Warehouse, 
generates a `kepler.gl <https://kepler.gl>`__ visualization with it and loads it in the ``activity_visualizations`` table.

This visualization is then served by the backend in the :doc:`../activity-overview` page of the app.

It is scheduled to run on the 1st of each month.
