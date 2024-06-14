import { expect } from '@jest/globals'

import { getHtmlContent } from '../utils'

describe('PriorNotificationCard/utils.getHtmlContent()', () => {
  it('Should format the HTML template', () => {
    // Given
    const pno = {
      flagState: 'ESP',
      integrationDateTime: '2024-06-14T06:52:22.978603Z',
      internalReferenceNumber: 'CFR101',
      isCorrectedByNewerMessage: false,
      isDeleted: false,
      isSentByFailoverSoftware: false,
      message: {
        catchOnboard: [
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'FRF',
            speciesName: 'DIVERS POISSONS(EAU DOUCE)',
            statisticalRectangle: '23E6',
            weight: 25
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'AFH',
            speciesName: 'APHYOSEMION AHLI',
            statisticalRectangle: '23E6',
            weight: 150
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'AFI',
            speciesName: 'CONOCARA FIOLENTI',
            statisticalRectangle: '23E6',
            weight: 250
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'AFT',
            speciesName: 'AGONUS CATAPHRACTUS',
            statisticalRectangle: '23E6',
            weight: 75
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'AFU',
            speciesName: 'ALFARO CULTRATUS',
            statisticalRectangle: '23E6',
            weight: 10
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'APX',
            speciesName: 'HOLBICHE PORC',
            statisticalRectangle: '23E6',
            weight: 430
          },
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            species: 'AQD',
            speciesName: 'APELTES QUADRACUS',
            statisticalRectangle: '23E6',
            weight: 90
          }
        ],
        catchToLand: [],
        pnoTypes: [
          {
            hasDesignatedPorts: false,
            minimumNotificationPeriod: 4,
            pnoTypeName: 'Préavis type A'
          },
          { hasDesignatedPorts: true, minimumNotificationPeriod: 8, pnoTypeName: 'Préavis type B' }
        ],
        port: 'FRVNE',
        portName: 'Vannes',
        predictedArrivalDatetimeUtc: '2024-06-14T10:07:22Z',
        predictedLandingDatetimeUtc: '2024-06-14T11:07:22Z',
        purpose: 'LAN',
        tripStartDate: '2024-06-13T21:07:22Z'
      },
      messageType: 'PNO',
      operationDateTime: '2024-06-14T06:52:22.978603Z',
      operationNumber: 'FAKE_OPERATION_104',
      operationType: 'DAT',
      rawMessage: '<Flux>Message FLUX xml</Flux>',
      reportDateTime: '2024-06-14T06:52:22.978603Z',
      reportId: 'FAKE_OPERATION_104',
      tripGears: [
        { dimensions: '250;180', gear: 'TB', mesh: 100 },
        {
          dimensions: '250;280',
          gear: 'TBS',
          mesh: 120.5
        }
      ],
      tripSegments: [
        { code: 'NWW03', name: 'Chalut de fond en eau profonde' },
        {
          code: 'NWW05',
          name: 'Chalut à perche'
        }
      ],
      vesselName: 'VIVA ESPANA'
    }
    const gears = [
      {
        dimensions: '250;180',
        gear: 'TB',
        gearName: 'Chaluts de fond (non spécifiés)',
        mesh: 100
      },
      { dimensions: '250;280', gear: 'TBS', gearName: 'Chaluts de fond à crevettes', mesh: 120.5 }
    ]

    // When
    const result = getHtmlContent(pno, gears)

    // Then
    expect(result).toEqual(`
<!DOCTYPE html><html lang="fr">
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <header>
      <h1>
        <p>PREAVIS - Débarquement</p>
        <p>
        VIVA ESPANA
        <img id="state_flag_icon" src="flags/es.png" />
        </p>
      </h1>
      <ul id="vessel_ids_list">
        <li>CFR - CFR101</li>
        <li>Marquage ext. - Aucun</li>
        <li>IMO - Aucun</li>
        <li>Call Sign - Aucun</li>
      </ul>
    </header>
    <main>
      <section>
        <h2>INFOS DU PRÉAVIS</h2>
        <hr/>
        <table>
          <tr><td class="data-label">Préavis envoyé</td><td><strong>le 14/06/2024 à 06h52 UTC</strong></td></tr>
          <tr><td class="data-label">Arrivée estimée</td><td><strong>le 14/06/2024 à 10h07 UTC</strong></td></tr>
          <tr><td class="data-label">Débarque prévue</td><td><strong>le 14/06/2024 à 11h07 UTC</strong></td></tr>
          <tr><td class="data-label"></td><td></td></tr>
          <tr><td class="data-label">Port de débarque</td><td><strong>Vannes (FRVNE)</strong></td></tr>
          <tr><td class="data-label">Décision CNSP</td><td><strong class="decision">Autorisation donnée d'entrer au port<br/>Autorisation donnée de débarquer</strong></td></tr>
        </table>
      </section>
      <section>
        <h2>ACTIVITÉ DU NAVIRE</h2>
        <hr/>
        <table>
          <tr><td class="data-label">Engin(s) utilisé(s)</td><td><strong>Chaluts de fond (non spécifiés) (TB) - Maillage 100 mm, Chaluts de fond à crevettes (TBS) - Maillage 120.5 mm</strong></td></tr>
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
          <tbody><tr>
          <td>HOLBICHE PORC - (APX)</td>
          <td>27.8.a (23E6)</td>
          <td>430</td>
          <td>-</td>
        </tr><tr>
          <td>CONOCARA FIOLENTI - (AFI)</td>
          <td>27.8.a (23E6)</td>
          <td>250</td>
          <td>-</td>
        </tr><tr>
          <td>APHYOSEMION AHLI - (AFH)</td>
          <td>27.8.a (23E6)</td>
          <td>150</td>
          <td>-</td>
        </tr><tr>
          <td>APELTES QUADRACUS - (AQD)</td>
          <td>27.8.a (23E6)</td>
          <td>90</td>
          <td>-</td>
        </tr><tr>
          <td>AGONUS CATAPHRACTUS - (AFT)</td>
          <td>27.8.a (23E6)</td>
          <td>75</td>
          <td>-</td>
        </tr><tr>
          <td>DIVERS POISSONS(EAU DOUCE) - (FRF)</td>
          <td>27.8.a (23E6)</td>
          <td>25</td>
          <td>-</td>
        </tr><tr>
          <td>ALFARO CULTRATUS - (AFU)</td>
          <td>27.8.a (23E6)</td>
          <td>10</td>
          <td>-</td>
        </tr></tbody>
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
          </td>
        </tr>
      </table>
    </footer>
  </body>
</html>`)
  })
})
