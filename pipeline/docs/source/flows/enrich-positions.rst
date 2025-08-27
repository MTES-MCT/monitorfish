================
Enrich positions
================

The ``Enrich positions`` flow analyzes the VMS route of vessels and computes a number of 
features which are then inserted in additionnal computed columns of the ``positions`` table :

* ``is_at_port`` : a boolean which is ``true`` if the position is in one of the ``anchorage`` H3 cells and ``false`` otherwise
* distance, time and average speed from the previous emitted position
* total time of continuous emission since the last exit of a harbour
* ``is_fishing`` : a boolean which is ``true`` if the fishing activity is detected and ``false`` otherwise (see below)

It is scheduled to run every minute.

Fishing detection
-----------------

Based on several years of VMS and logbook data, it has been observed that fishing activity can be detected on a VMS track 
with great accuracy, for any type of fishing gear, using the following criteria :

* the vessel is at sea (i.e. outside of a port) for > 1 hour
* the vessel's *average speed* (i.e. the distance between two VMS positions divided by the time between the two positions) remains between 0.0025 and 5.5 knots twice in a row

.. image:: /_static/img/fishing-detection.png
  :width: 800
  :alt: Map with VMS tracks colored in green where fishing activity is detected

*VMS tracks colored in green where fishing activity is detected*

Note : the 0.0025 knots lower bound is useful to filter out vessels at anchor