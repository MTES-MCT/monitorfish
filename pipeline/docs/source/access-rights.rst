=============
Access rights
=============

Monitorfish is used by the agents of the FMC (`CNSP <https://www.mer.gouv.fr/la-police-des-peches>`__) and by its partners
(control units, regional and departmental administrations...). Users are authenticated with ProConnect (see :doc:`authentication`)
and have one of two profiles :

* **super users** (FMC agents) : access to all features
* **regular users** : access to a subset of features, focused on the monitoring of vessels

======================================================  ==========  ============
Feature                                                 Super user  Regular user
======================================================  ==========  ============
Map, vessel search, :doc:`vessel sheet <vessel-sheet>`  yes         yes [#]_
:doc:`map-and-layers`                                   yes         yes
:doc:`vessel-list`                                      yes         yes
:doc:`groups-of-vessels`                                yes         yes [#]_
:doc:`prior-notifications`                              yes         read only [#]_
:doc:`missions-and-controls`                            yes         no
:doc:`alerts` and :doc:`reportings`                     yes         no
:doc:`vms-beacon-monitoring`                            yes         no
:doc:`control-units`                                    yes         no
:doc:`Risk factor <risk-factor>` display                yes         no
:doc:`back-office`                                      yes         no
======================================================  ==========  ============

.. [#] Regular users see the controls history, but not the reportings tab, the risk factor nor the alerts and beacon malfunctions.
.. [#] Regular users cannot share groups with other teams.
.. [#] When enabled for the deployment.

The *What's new* panel (*"Nouveautés"*) and the startup notifications of the app are also adapted to each profile.
