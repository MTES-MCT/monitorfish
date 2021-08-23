==============
Last Positions
==============

The ``last_positions`` flow extracts 

* the most recent **position** of each vessels from the ``positions`` table
* the most recent **control** of each vessels from the ``controls`` table
* the current **fleet segments** of each vessel from the ``current_segments`` table 

then joins the results and dumps them in the ``last_positions`` table, which is used 
by the backend to to display vessels on the map.

It is scheduled to run every minute.