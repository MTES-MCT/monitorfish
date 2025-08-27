Vessel identification
=====================

For identifying vessels and related information, we use :

* ``vessel_id`` (`Navpro <https://sipa.agriculture.gouv.fr/nav-pro-r62.html>`__ identifier) for :
    * VMS `Beacon` and `BeaconMalfunction` (a vessel must have a ``vessel_id`` from `Navpro` to emit VMS)
    * `Vessel` characteristics (fetched from `Navpro`)
    * `Control`
* ``internal_reference_number`` (Community Fleet Register - CFR) for :
    * `Logbook` containing `ERS` (Electronic Reporting System) and `FLUX` (Fisheries Language for Universal Exchange) messages
* ``internal_reference_number`` (Community Fleet Register - CFR), ``ircs`` (International Radio Call Sign of the vessel) and ``external_reference_number`` (side number, registration number, IMO number or any other external marking identifying the vessel) for :
    * VMS `Position`
    * `Alert` and `Reporting`
