=============
Risk elements
=============

The ``Risk elements`` flow computes, for each vessel and over the last 12 months, a set of **risk elements** which measure 
the vessel's compliance history, and loads them into the ``vessels_risk_elements`` table :

==========  ==========================================  =================================================================================
Code        Risk element                                Metric
==========  ==========================================  =================================================================================
``PNO_MR``  Prior notification misrecording             share of trips subject to PNO without a valid (logbook or manual) PNO
``MOT_MR``  Exceeding the margin of tolerance           share of trips exceeding the margin of tolerance on declared quantities
``VMS_MR``  Unjustified VMS failure                     number of beacon malfunctions
``CLA_CM``  Fishing in closed area                      number of occurrences of fishing in closed areas
==========  ==========================================  =================================================================================

Each metric is converted into a risk level from 1 to 4.

Data is extracted from the Data Warehouse and from the Monitorfish database. The definitions of risk elements, and the 
threats they characterize, are initialized by the :doc:`init-infraction-threat-characterization` flow.

It is scheduled to run every day.
