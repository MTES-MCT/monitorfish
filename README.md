<h1 align="center">
  <img src="https://d33wubrfki0l68.cloudfront.net/daf4a5624cac646b0bc921d0a72ae1cf1912b902/35340/img/eig4/monitorfish.png" alt="MonitorFish" title="MonitorFish" height="150px" />
  MonitorFish
</h1> 

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MTES-MCT_monitorfish&metric=alert_status)](https://sonarcloud.io/dashboard?id=MTES-MCT_monitorfish) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License](https://img.shields.io/github/license/MTES-MCT/monitorfish)](https://github.com/MTES-MCT/monitorfish/blob/master/LICENCE)
[![Documentation Status](https://readthedocs.org/projects/monitorfish/badge/?version=latest)](https://monitorfish.readthedocs.io/en/latest/?badge=latest)
[![MonitorFish](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/9b7q8z/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/9b7q8z/runs)

> Improve monitoring and controlling of the activities of fishing vessels

## What is it ?
**Monitorfish** is a **fishing vessels monitoring software** developped by the French administration for the french **Fisheries Monitoring Center (FMC)** - the [Centre National de Surveillance des Pêches](https://www.mer.gouv.fr/la-police-des-peches) - and its partners.

## Main features

- Visualization of fishing vessels' real time **positions** (VMS)
- Visualization of fishing vessels' declarative **fishing activity** data (ERS and FLUX)
- Vizualization of synthetic [activity overview](https://monitorfish.readthedocs.io/en/latest/activity-overview.html)
- [Activity report](https://monitorfish.readthedocs.io/en/latest/activity-report.html) (Act-Rep)
- [Inspection reports data entry](https://monitorfish.readthedocs.io/en/latest/inspection-data-entry.html)
- Visualization of fishing vessels’ historical inspections and violations
- Visualization of [regulated fishing areas](https://monitorfish.readthedocs.io/en/latest/regulation.html) of the french and european regulations
- Computation of fishing vessels' real time belonging to [fleet segments](https://monitorfish.readthedocs.io/en/latest/fleet-segments.html) as defined by the [European Fishing Control Agency (EFCA)](https://www.efca.europa.eu/en) in its [risk assessment methodology](https://www.efca.europa.eu/en/content/guidelines-risk-assessment-methodology-fisheries-compliance)
- Real time fraud detection [alerts](https://monitorfish.readthedocs.io/en/latest/alerts.html)
- Computation of fishing vessels' real time [risk factor ](https://monitorfish.readthedocs.io/en/latest/risk-factor.html), a metric developed in the context of the Monitorfish project that aims to help FMC agents **prioritize vessels to control** based on all the above elements
- Compliance checking of [prior notifications](https://monitorfish.readthedocs.io/en/latest/prior-notifications.html) of return to port and prioritization for land inspections
- Creation and sharing of [groups of vessels](https://monitorfish.readthedocs.io/en/latest/groups-of-vessels.html)
- Administration panel that allows admins to
    - Update regulation data : update authorized fishing areas / periods / gears...
    - Update the definitions of [fleet segments](https://monitorfish.readthedocs.io/en/latest/fleet-segments.html)
    - [Stear control priorities](https://monitorfish.readthedocs.io/en/latest/control-priority-steering.html) by dynamically adjuting the control priority level of each fleet segment

## Demo
[![Monitorfish demo](/images/video-demo.png)](https://player.vimeo.com/video/563710999)

## License
[GNU Affero GPL Version 3](https://github.com/MTES-MCT/monitorfish/blob/master/LICENCE)

## Documentation
The full documentation is hosted [here](https://monitorfish.readthedocs.io/en/latest/).

## Background
The motivation of the french FMC was to streamline its operations and better enforce fishing regulations by developing an **integrated tool** that makes all information relevant to the coordination of fishing control easily accessible. Furthermore, the tool was to act as a **decision support system** to better detect and prevent violations.

On the initiative of the french FMC, the project started in September 2020 as a challenge of the [Entrepreneur d'Intérêt Général (EIG)](https://www.eig.numerique.gouv.fr/) program which helps initiate digital projects in the french administration. More information on the [page of the EIG challenge](https://www.eig.numerique.gouv.fr/defis/monitorfish/).

After 10 months of incubation in the EIG program, the software is in production and used daily by the french FMC.

The project continues as a [startup d'Etat](https://beta.gouv.fr/startups/monitorfish.html) in the [beta.gouv.fr](https://beta.gouv.fr) organization, with the objective to develop additional funtionalities.

## Open data
In line with the philosophy of the EIG program, all data that can be opened is made publicly available. Opened datasets :
* [Statistiques de contrôle des pêches](https://www.data.gouv.fr/fr/datasets/637c9225bad9521cdab12ba2/)
* [Ports of the ERS system with their localization](https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/)
* [Regulated fishing areas of the french and european regulation](https://www.data.gouv.fr/fr/datasets/reglementation-des-peches-cartographiee/)

## Contributing
External contributions are welcome. If you wish to volunteer, please [get in touch](mailto:vincent.chery@m4x.org).
