<h1 align="center">
  <img src="https://d33wubrfki0l68.cloudfront.net/daf4a5624cac646b0bc921d0a72ae1cf1912b902/35340/img/eig4/monitorfish.png" alt="MonitorFish" title="MonitorFish" height="150px" />
  MonitorFish
</h1> 

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MTES-MCT_monitorfish&metric=alert_status)](https://sonarcloud.io/dashboard?id=MTES-MCT_monitorfish) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License](https://img.shields.io/github/license/MTES-MCT/monitorfish)](https://github.com/MTES-MCT/monitorfish/blob/master/LICENCE)

> Improve monitoring and controlling of the activities of fishing vessels

## What is it ?
**Monitorfish** is a **fishing vessels monitoring software** developped by the French adminitration for the french **Fishing Monitoring Center (FMC)** - the [Centre National de Surveillance des Pêches](https://www.mer.gouv.fr/la-police-des-peches) - and its partners.

## Main features
* Visualization of fishing vessels' real time **positions** (VMS)
* Visualization of fishing vessels' declarative **fishing activity** data (ERS)
* Visualization of fishing vessels' historical **controls** and **violations**
* Visualization of french and european **regulated fishing areas**
* Computation of fishing vessels' real time **belonging to fleet segments** as defined by the [European Fishing Control Agency (EFCA)](https://www.efca.europa.eu/en) in its [risk assessment methodology](https://www.efca.europa.eu/sites/default/files/Risk%20Assessment%20Methodology.pdf)
* Computation of fishing vessels' **risk factor**, a metric developed in the context of the Monitorfish project that aims to help FMC agents **prioritize vessels to control** based on all the above elements
* Administration panel to steer control priorities, update regulation data...

## Demo
[![Monitorfish demo](/images/video-demo.png)](https://player.vimeo.com/video/563710999)

## License
[GNU Affero GPL Version 3](https://github.com/MTES-MCT/monitorfish/blob/master/LICENCE)

## Documentation
The full documentation is hosted [here](https://mtes-mct.github.io/monitorfish/).

## Background
The motivation of the french FMC was to streamline its operations and better enforce fishing regulations by developing an **integrated tool** that makes all information relevant to the coordination of fishing control easily accessible. Furthermore, the tool was to act as a **decision support system** to better detect and prevent violations.

On the initiative of the french FMC, the project started in September 2020 as a challenge of the [Entrepreneur d'Intérêt Général (EIG)](https://entrepreneur-interet-general.etalab.gouv.fr/index.html) program which helps ignitiate digital projects in the french administration. More information on the [page of the EIG challenge](https://entrepreneur-interet-general.etalab.gouv.fr/defis/2020/monitorfish.html).

After 10 months of incubation in the EIG program, the software is in production and used daily by the french FMC.

The project continues outside of the context of the EIG program, with the objective to develop additional funtionalities.

## Roadmap
The project roadmap can be found [here](https://github.com/MTES-MCT/monitorfish/projects/3)

## Open data
In line with the philosophy of the EIG program, all data that can be opened is made publicly available. Opened datasets :
* [Ports of the ERS system with their localization](https://www.data.gouv.fr/fr/datasets/liste-des-ports-du-systeme-ers-avec-donnees-de-position/)
* [Regulated fishing areas of the french and european regulation](https://www.data.gouv.fr/fr/datasets/reglementation-des-peches-cartographiee/)

## Contributing
External contributions are welcome. If you wish to volunteer, please [get in touch](mailto:vincent.chery@m4x.org).



