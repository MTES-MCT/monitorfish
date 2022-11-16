====================
Missing trip numbers
====================

The ``Missing trip numbers`` flow adds computed trip numbers to reports of the ``logbook_reports`` table that miss a trip number.
Computed trip number are computed as follows :

* for each year ``YYYY`` and each vessel, trip numbers start with ``YYYY0001``
* subsequent reports are assigned a trip number which :
  * is incremented by 1 if the report is a ``DEP`` or if it follows a ``LAN`` (which indicates that it is the start of a new trip)
  * is identical to the previous report otherwise
 
It is scheduled to run every 10 minutes.