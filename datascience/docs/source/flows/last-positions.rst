==============
Last Positions
==============

The ``last_positions`` flow extracts 

* the most recent **position** of each vessels from the ``positions`` table
* the current **fleet segments**, **risk factor** and **control anteriority** of each vessel from the ``risk_factors`` table 
* the current **alerts** of each vessel from the ``pending_alerts`` table 
* the current **beacon malfunctions** of each vessel from the ``beacon_malfunctions`` table 
* the current **reportings** of each vessel from the ``reportings`` table 

then joins the results and dumps them in the ``last_positions`` table, which is used 
by the backend to to display vessels on the map.

It is scheduled to run every minute.