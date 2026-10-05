
Overview
======== 

**Monitorfish** is a **fishing vessels monitoring software** developed by the French administration for the french **Fisheries Monitoring Center (FMC)** - the `Centre National de Surveillance des Pêches <https://www.mer.gouv.fr/la-police-des-peches>`_ - and its partners.

Features
--------

Monitoring
^^^^^^^^^^

* Visualization of fishing vessels' real time **positions** (VMS and AIS) and tracks on a :doc:`map <map-and-layers>`, with 
  regulatory and administrative zones
* A :doc:`vessel sheet <vessel-sheet>` gathering each vessel's identity, declarative **fishing activity** (ERS logbook), 
  :doc:`usual activity <vessel-profiles>`, **controls** history, :doc:`reportings` and VMS equipment
* A :doc:`list of all vessels <vessel-list>` with advanced filters, and :doc:`groups of vessels <groups-of-vessels>` that can be shared
* Real time fraud detection :doc:`alerts <alerts>`, including user-defined alerts, and :doc:`reportings`
* Monitoring of :doc:`VMS beacon malfunctions <vms-beacon-monitoring>`
* Compliance checking of :doc:`prior notifications <prior-notifications>` of return to port, prioritization and distribution 
  to control units for land inspections

Targeting
^^^^^^^^^

* Computation of fishing vessels' real time belonging to :doc:`fleet segments <fleet-segments>` as defined by the 
  `European Fishing Control Agency (EFCA) <https://www.efca.europa.eu/en>`_ in its 
  `risk assessment methodology <https://www.efca.europa.eu/en/content/guidelines-risk-assessment-methodology-fisheries-compliance>`_
* Computation of fishing vessels' real time :doc:`risk factor <risk-factor>`, a metric developed in the context of the 
  Monitorfish project that aims to help FMC agents **prioritize vessels to control** based on all the above elements
* :doc:`Control priority steering <control-priority-steering>` by dynamically adjusting the control priority level of each fleet segment
* Synthetic :doc:`activity overview <activity-overview>` to plan inspections

Controls
^^^^^^^^

* :doc:`Missions and inspection reports <missions-and-controls>` data entry, shared with Monitorenv
* :doc:`Activity report (Act-Rep) <activity-report>` export for the EFCA
* :doc:`Control units <control-units>` directory

Administration
^^^^^^^^^^^^^^

* A :doc:`back office <back-office>` to update regulation data (authorized fishing areas, periods, gears...), fleet segments, 
  control objectives, prior notification distribution and producer organization memberships
* :doc:`Access rights <access-rights>` adapted to FMC agents and partners

Open data
^^^^^^^^^

* Publication of :doc:`regulated fishing areas <regulation>`, ports and control statistics on data.gouv.fr (see :doc:`data-sources`)


Demo
----

..  raw:: html

    <iframe title="vimeo-player" src="https://player.vimeo.com/video/563710999?h=d2654e3cb5" width="640" height="360" frameborder="0" allowfullscreen></iframe>



