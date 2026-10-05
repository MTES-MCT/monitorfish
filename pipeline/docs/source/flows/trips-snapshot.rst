==============
Trips snapshot
==============

The ``Trips snapshot`` flow extracts the start and end dates of all logbook trips of all vessels from the Data Warehouse 
and loads them into the ``trips_snapshot`` table of the Monitorfish database.

This table is used by the backend to find the trip during which a past control took place.

It is scheduled to run every day.
