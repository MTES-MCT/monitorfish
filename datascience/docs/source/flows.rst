.. _flows:

=====
Flows
=====


What are flows?
===============

*Flows* are batch jobs that move and transform data. Collectively, they constitute the :ref:`data-pipeline` part of 
the Monitorfish architecture.

Each batch job is written as a `Prefect flow <https://docs.prefect.io/core/concepts/flows.html#overview>`__
which typically extracts data  (from external sources and / or from tables in the 
Monitorfish database), processes the data and loads it back into a table of the Monitorfish database.

Flows are composed of `tasks <https://docs.prefect.io/core/concepts/tasks.html#overview>`__ typically written
as python pure functions. `The UI <http://prefect.csam.e2.rie.gouv.fr/>`__ (restricted access) enables 
administrators to view each flow as a diagram of its constituent tasks, to monitor their execution, see 
the logs and debug in case any flow run fails...

Overview of flows in Monitorfish
================================

Flow that imports administrative areas :

.. image:: _static/img/admin_areas_flows.png
  :width: 800
  :alt: Schematic of administrative areas data flow

Flows that import repositories (species, gears, infractions...) :

.. image:: _static/img/repository_flows.png
  :width: 800
  :alt: Schematic of repositories flows


Flows that import and perform a check-up on regulations data :

.. image:: _static/img/regulation_flows.png
  :width: 800
  :alt: Schematic of regulation flows


Flows that perform computations that are internal to Monitorfish (alerts, fishing detection...):

.. image:: _static/img/alerts_and_internals_flows.png
  :width: 800
  :alt: Schematic of internal computations flows


Flows that contribute to maintaining an up-to-date `last_positions` table :


.. image:: _static/img/last_positions_flows.png
  :width: 800
  :alt: Schematic of last positions flows


----

List of flows
=============

.. toctree::
    :maxdepth: 1

    flows/administrative-areas
    flows/anchorages
    flows/beacons
    flows/control-anteriority
    flows/controllers
    flows/controls
    flows/current-segments
    flows/districts
    flows/enrich-positions
    flows/facade-areas
    flows/fao-areas
    flows/fishing-gears
    flows/infractions
    flows/last-positions
    flows/logbook
    flows/missing-far-alerts
    flows/missing-trip-numbers
    flows/ports
    flows/position-alerts
    flows/regulations-checkup
    flows/regulations
    flows/risk-factor
    flows/scrape-legipeche
    flows/species-groups
    flows/species
    flows/vessels