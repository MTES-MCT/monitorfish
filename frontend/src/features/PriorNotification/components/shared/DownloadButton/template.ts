/**
 * This HTML template is being enriched by `utils/fillTemplate()`
 * All variables in the `{variable}` format are replaced by the value.
 */
export const HTML_TEMPLATE = `
<!DOCTYPE html><html lang="fr">
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <header>
      <h1>
        <p>PREAVIS - {purpose}</p>
        <p>
        {vesselName}
        <img id="state_flag_icon" src="{flagStateFilePath}" />
        </p>
      </h1>
      <ul id="vessel_ids_list">
        <li>CFR - {internalReferenceNumber}</li>
        <li>Marquage ext. - {externalReferenceNumber}</li>
        <li>IMO - {imo}</li>
        <li>Call Sign - {ircs}</li>
      </ul>
    </header>
    <main>
      <section>
        <h2>INFOS DU PRÉAVIS</h2>
        <hr/>
        <table>
          <tr>
            <td class="data-label">Préavis envoyé</td>
            <td><strong>{operationDateTime}</strong></td>
          </tr>
          <tr>
            <td class="data-label">Arrivée estimée</td>
            <td><strong>{predictedArrivalDatetimeUtc}</strong></td>
          </tr>
          <tr>
            <td class="data-label">Débarque prévue</td>
            <td><strong>{predictedLandingDatetimeUtc}</strong></td>
          </tr>
          <tr>
            <td class="data-label"></td>
            <td></td>
          </tr>
          <tr>
            <td class="data-label">Port de débarque</td>
            <td><strong>{portName} ({port})</strong></td>
          </tr>
          <tr>
            <td class="data-label">Décision CNSP</td>
            <td>
            {portEntranceAuthorization}
            {portLandingAuthorization}
            </td>
          </tr>
        </table>
      </section>
      <section>
        <h2>ACTIVITÉ DU NAVIRE</h2>
        <hr/>
        <table>
          <tr><td class="data-label">Engin(s) utilisé(s)</td><td><strong>{gearDetails}</strong></td></tr>
        </table>
        <p class="data-label">Espèces à bord par zone de pêche <em>(tous les poids sont vifs)</em> :</p>
        <table border="1" class="dataframe">
          <thead>
            <tr style="text-align: left;">
              <th>Espèces</th>
              <th>Zones de pêche</th>
              <th>Qtés (kg)</th>
              <th>Nb</th>
            </tr>
          </thead>
          <tbody>{catchDetails}</tbody>
        </table>
      </section>
    </main>
    <footer>
      <hr/>
      <p><strong>Centre National de Surveillance des Pêches</strong></p>
      <p>40 avenue Louis Bougo</p>
      <p>56410 Étel</p>
      <p>(0)2 97 29 34 27</p>
      <table id="logos">
        <tr>
          <td>
            <img id="logo_cnsp" src="logo_cnsp.jpg" alt="Logo CNSP"/>
          </td>
          <td>
            <img id="logo_se_mer" src="logo_se_mer.jpg" alt="Logo Secretariat d'Etat chargé de la Mer et de la Biodiversité"/>
          </td>
        </tr>
      </table>
    </footer>
  </body>
</html>`

export const HTML_STYLE = `
@page {
    margin: 0;
    size: 15.75cm 22.275cm;
}

:root {
    --white: #FFFFFF;
    --gainsboro: #E5E5EB;
    --light-gray: #CCCFD6;
    --cadet-grey: #8E9A9F;
    --slate-gray: #707785;
    --gunmetal: #282F3E;
    --maximum-red-15: #FBD9DB;
    --grullo: #B89B8C;
    --copper-red: #CF6A4E;
    --chinese-red: #A13112;
    --maximum-red: #E1000F;
    --medium-sea-green: #29B361;
}

html {
    margin: 0;
    padding: 0px;
    font: 11px sans-serif;
    line-height: 15px;
    color: var(--gunmetal);
}

body {
    margin: 0 auto;
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
}


body > * {
    padding: 0 0px 0 0px;
}

header {
    padding-top: 40px;
    padding-bottom: 25px;
    padding-right: 64px;
    padding-left: 64px;
    background-color: #CCCFD6;
    font-size: 10px;
    line-height: 14px;
}

header > p {
    margin: 0;
}

h1 {
    margin-top: 0px;
    margin-bottom: 8px;
    font-size: 15px;
    line-height: 21px;
    text-transform: uppercase;
}

h1 > p {
    margin: 0;
}

ul {
    margin-top: 0;
    padding-right: 16px;
}

#state_flag_icon {
    margin-left: 5px;
    height: 14px;
    width: 15px;
    height: 10px;
}

#vessel_length {
    font-style: italic;
}

.cadet-grey {
    background-color: var(--cadet-grey);
}

.grullo {
    background-color: var(--grullo);
}

.copper-red {
    background-color: var(--copper-red);
}

.chinese-red {
    background-color: var(--chinese-red);
}


#vessel_ids_list {
    padding: 0;
    margin-bottom: 0;
}

#vessel_ids_list > li {
    display:inline-block;
    font-style: italic;
    list-style-type: none;
    margin-right: 15px;
}

main {
    margin-bottom: 39px;
    padding-right: 64px;
    padding-left: 64px;
}

h2 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 11px;
}

hr {
    border: 1px solid;
    color: #CCCFD6;
}

.data-label {
    color: #707785;
    padding-right: 16px;
    vertical-align: top;
}

.infractions-details {
    font-weight: bold;
    margin: 0;
}

.infraction-count {
    color: var(--maximum-red);
}

.authorized {
    color: var(--medium-sea-green);
}

.unauthorized {
    color: var(--maximum-red);
}

tr {
    text-align: left;
}


.dataframe {
    line-height: 22px;
    border-color: #CCCFD6;
}

.dataframe, .dataframe th, .dataframe td {
    border: 1px solid;
    border-collapse: collapse;
    border-color: #CCCFD6;
    padding-left: 8px;
}

.dataframe th {
    background-color: var(--gainsboro);
    font-weight: normal;
}

.dataframe tr {
    font-weight: bold;
}

.dataframe th:nth-child(1) {
    width: 184px;
}

.dataframe th:nth-child(2) {
    width: 184px;
}

.dataframe th:nth-child(3) {
    width: 64px;
}

.dataframe th:nth-child(4) {
    width: 39px;
}

footer {
    color: #707785;
    line-height: 11x;
    padding-right: 64px;
    padding-left: 64px;
}

footer > p {
    margin: 0;
}

#logos {
    margin-top: 16px;
}

#logo_cnsp {
    width: 80px;
}
#logo_se_mer {
    margin-left: 16px;
    width: 126.86px;
}
`
