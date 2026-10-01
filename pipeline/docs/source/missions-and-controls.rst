=====================
Missions and controls
=====================

Missions and controls are entered by the FMC (super users) in the side window. Missions are shared with 
`Monitorenv <https://github.com/MTES-MCT/monitorenv>`__ : a mission can contain both fisheries controls (entered in 
Monitorfish) and environmental actions (entered in Monitorenv).

Missions list
-------------

The missions list can be filtered by period, administration, control unit, mission type (sea, air, land), status, 
completion of data, control results, JDP missions and vessel. 

From this list, :doc:`activity reports (Act-Rep) <activity-report>` can be exported for each Joint Deployment Plan.

Mission form
------------

A mission has :

* one or several control units and their resources
* one or several types (sea, air, land), and whether it is under a Joint Deployment Plan (JDP)
* its dates, zones and observations

Actions of the mission can be :

* **sea controls** and **land controls** (inspection reports)
* **air controls** and **air surveillance**
* **observations**

Inspection reports
------------------

The inspection report form of a control records :

* the controlled vessel - its :doc:`groups <groups-of-vessels>` and open :doc:`reportings` are displayed when it is selected
* the position (sea controls) or the port (land controls) of the control
* the compliance of VMS and AIS emissions, logbook declarations, licences and authorizations
* the gears controlled, with their mesh
* the species onboard, with declared and controlled quantities, the margin of tolerance, undersized and discarded 
  quantities - species are prefilled from the vessel's logbook
* the infractions found (NATINF codes, sorted by family and type), with their result, and seizures (gears, species, vessel)
* whether the vessel is subject to IUU regulations
* the :doc:`fleet segments <fleet-segments>`, computed from the controlled data

The form is saved automatically. Its completion status lists the missing fields, so that missions can be checked and completed.

The controls are then displayed in the vessel's controls history (see :doc:`vessel-sheet`) and used to compute its 
:doc:`risk factor <risk-factor>` and :doc:`fleet segments <fleet-segments>` control statistics.

The data model of inspection reports is being aligned on the EFCA electronic Inspection and Surveillance Report (e-ISR) ; 
the corresponding fields are enabled progressively.
