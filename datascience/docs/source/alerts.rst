======
Alerts
======

Monitorifsh performs **real time fraud detection** using VMS, logbook and regulations data. The types of fraud currenlty detected are :

* trawling in the french 3 nautical miles coastal strip
* fishing in the french 12 nautical miles coastal strip by a non-french vessel (excluding historic fishing rights for certains states)
* fishing without logging any Fishing Activity Report (FAR) in the fishing logbook before midnight

When signs of fraud are detected on a vessel, it appears on the map with a red halo :

.. image:: _static/img/3-miles-trawling-alert.png
  :width: 800
  :alt: Map showing a vessel's VMS track which presents signs of illegal trawling in the 3 nautical miles coastal strip

*Map showing a vessel's VMS track which presents signs of illegal trawling in the 3 nautical miles coastal strip*

Alerts are then humanly checked and validated / invalidated. Validated alerts become *reportings* which are stored in the Monitorfish database and add the vessel's history.

Alerts make use of the fishing detection algorithm of the :doc:`enrich position flow <flows/enrich-positions>`.