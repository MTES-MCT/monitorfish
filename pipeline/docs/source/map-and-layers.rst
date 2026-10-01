==============
Map and layers
==============

The main window of Monitorfish is a map showing the last position of all vessels, refreshed every few minutes. 

Vessels on the map
------------------

* vessels are shown with their heading ; vessels whose last position is older than 3 hours are faded, and the estimated 
  current position of vessels can be displayed
* hovering a vessel shows its identity, last position and its alerts, reportings and beacon malfunctions
* clicking a vessel opens its :doc:`vessel sheet <vessel-sheet>` and displays its track
* right-clicking a vessel allows to display its track for a custom date range
* vessels can be filtered by :doc:`groups of vessels <groups-of-vessels>`, :ref:`followed vessels <followed-vessels>` 
  or by drawing a zone on the map

Map settings
------------

The map settings (*"Paramétrer l'affichage"*) allow to :

* choose the default depth of tracks
* choose the label of vessels (name, CFR, nationality, :doc:`fleet segments <fleet-segments>`...) and show or hide labels
* show or hide the :doc:`risk factor <risk-factor>` of vessels, estimated positions and non-selected vessels

Layers
------

The layers sidebar allows to display :

* **regulatory zones** (:doc:`regulation`) : search zones by name, gear, species, regulatory reference or by drawing a zone 
  on the map, show zones on the map and read their details (authorized gears and species, fishing periods, regulatory references)
* **administrative zones** : EEZs, 3, 6 and 12 nautical miles coastal strips, FAO areas, statistical rectangles, effort zones,
  facades, transverse sea limits, Regional Fisheries Management Organizations (NEAFC, NAFO, ICCAT, IOTC, GFCM, CCAMLR, SIOFA)...
* **imported zones** : any GeoJSON, GPX, KML, IGC or TopoJSON file can be dragged and dropped on the map, then renamed, hidden or deleted
* **base maps** : dark, light, OpenStreetMap, satellite or SHOM nautical charts

The layers displayed by each user are saved and restored at the next connection.

Map tools
---------

* **measurement** : measure a distance, or draw a circle of a given radius around a point (*"Rayon d'action"*)
* **interest points** : add points on the map with a type, a title, a description and coordinates
* **missions and controls** : display missions and controls on the map (super users)
* **reportings** : display :doc:`reportings` on the map (super users)
* **control units and stations** : see :doc:`control-units` (super users)

Other features
--------------

* a banner warns users when VMS or logbook data has stopped being received
* the *"Mon compte"* menu allows to log out and to manage the local cache of base maps : base maps can be downloaded in 
  advance to use Monitorfish with a degraded network connection
* the *"Nouveautés"* panel lists the latest features of the app
