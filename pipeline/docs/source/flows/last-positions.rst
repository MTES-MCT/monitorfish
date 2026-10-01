==============
Last Positions
==============

The ``last_positions`` flow extracts 

* the most recent VMS **position** of each vessel from the ``positions`` table
* the most recent AIS **position** of each vessel from the ``ais_positions_hourly`` table
* the current **fleet segments**, **risk factor** and **control anteriority** of each vessel from the ``risk_factors`` table 
* the current **alerts** of each vessel from the ``pending_alerts`` table 
* the current **beacon malfunctions** of each vessel from the ``beacon_malfunctions`` table 
* the current **reportings** of each vessel from the ``reportings`` table 

then joins the results and dumps them in the ``last_positions``, ``last_positions_vms`` and ``last_positions_ais`` 
tables, which are used by the backend to display vessels on the map and in the vessel list.

It is scheduled to run every 2 minutes.
