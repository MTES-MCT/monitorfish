======
Alerts
======

Monitorifsh performs **real time fraud detection** using VMS, logbook and regulations data. The types of fraud currenlty detected are :

* trawling in the french 3 nautical miles coastal strip
* fishing in the french 12 nautical miles coastal strip by a non-french vessel (excluding historic fishing rights for certains states)
* fishing in the french Exclusive Economic Zone (EEZ) by a non-Community vessel
* undeclared fishing activity : VMS track showing fishing activity with no corresponding Fishing Activity Report (FAR) in the electronic logbook
* undeclared departure at sea : VMS track showing a departure at sea with no corresponding Departure (DEP) declaration in the electronic logbook
* suspicion of under-declaration : fishing effort non consistent with declared quantities
* RTC fishing alert : VMS track showing fishing activity in a Real Time Closure (RTC) area
* NEAFC fishing alert : VMS track showing fishing activity in the NEAFC area (subject to authorization by NEAFC)
* exceeding the maximum authorized blue ling (BLI) quantity held onboard : logbook data showing more than 6 tons of blue ling (BLI) onboard a vessel present in area 27.6.a, which is the maximum quantity authorized by R(UE) 1241.
* user-defined configurable alerts : to detect ad-hoc behaviour, focus monitoring in a certain area...

When signs of fraud are detected on a vessel, it appears on the map with a red halo :

.. image:: _static/img/3-miles-trawling-alert.png
  :width: 800
  :alt: Map showing a vessel's VMS track which presents signs of illegal trawling in the 3 nautical miles coastal strip

*Map showing a vessel's VMS track which presents signs of illegal trawling in the 3 nautical miles coastal strip*

Alerts are then humanly checked and validated / invalidated. Validated alerts become *reportings* which are stored in the Monitorfish database and add the vessel's history.

Alerts make use of the fishing detection algorithm of the :doc:`enrich position flow <flows/enrich-positions>`.