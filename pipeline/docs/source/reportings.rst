==========
Reportings
==========

Reportings (*"Signalements"*) record facts about a vessel which are useful to the monitoring and targeting of vessels.
They are visible in the vessel's history and contribute to its :doc:`risk factor <risk-factor>`. Reportings are 
available to super users.

Types of reportings
-------------------

* **alerts** : :doc:`alerts` validated by an FMC agent
* **infraction suspicions** : suspicions of infringement, with a NATINF code
* **observations** : any other information on a vessel

Reportings can be flagged as related to IUU (illegal, unreported and unregulated) fishing. They can concern a vessel 
known to Monitorfish or an unknown vessel.

Reportings have a source (FMC, SIP, a control unit, a satellite picture, or another source such as a fisherman, an NGO, a DIRM...) 
and an end of validity : in 1 month, 12 months, at the next departure of the vessel, until further notice or at a chosen date.

Where to find reportings
------------------------

* **in the vessel sheet** : the *"Signalements"* tab shows current reportings, a summary of the last 12 months and the archived reportings. 
  Observations and infraction suspicions can be created from this tab.
* **in the side window** : the reportings table can be searched, filtered (by seafront, type, status, IUU...) and sorted. 
  Reportings can be edited, duplicated, archived, deleted or downloaded.
* **on the map** : reportings can be displayed on the map and filtered by type, status, source, IUU, period and zones. 
  IUU reportings can be created directly from the map, at the location of the observed vessel.

Archiving
---------

Reportings are archived manually, or automatically by the backend :

* at the end of their validity
* at the next departure of the vessel, when this validity was chosen
* when the vessel starts a new trip, for reportings created from alerts which have automatic archiving enabled
