const express = require('express')
const app = express()
const port = 8882

app.get('/api/v1/navires/consulterParNumeroNavires', (req, res) => {
    res.send(`{
  "codeEnumEtatPme": 0,
  "codeEtatPMEMet": {
    "bloque": true,
    "code": "string",
    "codeExport": "string",
    "codeLibelle": "string",
    "codeLibelleCourt": "string",
    "dateDebutApplication": "2020-11-10T13:35:47.168Z",
    "dateFinApplication": "2020-11-10T13:35:47.168Z",
    "idcNavEtatPmeMet": 0,
    "libelle": "string",
    "libelleAnglais": "string",
    "libelleCourt": "string",
    "libelleCourtAnglais": "string"
  },
  "codeGenreNavigationArmement": {
    "bloque": true,
    "code": "string",
    "codeExport": "string",
    "dateDebutApplication": "2020-11-10T13:35:47.168Z",
    "dateFinApplication": "2020-11-10T13:35:47.168Z",
    "idCode": 0,
    "libelle": "string",
    "libelleAnglais": "string",
    "libelleCourt": "string"
  },
  "codePaysFlotteur": {
    "bloque": true,
    "code": "string",
    "codeExport": "string",
    "dateDebutApplication": "2020-11-10T13:35:47.168Z",
    "dateFinApplication": "2020-11-10T13:35:47.168Z",
    "idCode": 0,
    "libelle": "string",
    "libelleAnglais": "string",
    "libelleCourt": "string"
  },
  "codeStatutNfr": "string",
  "dateDemandePmeMet": "2020-11-10T13:35:47.168Z",
  "dateDernierChangementEtatPmeMet": "2020-11-10T13:35:47.168Z",
  "estNavireEnDemandePa": true,
  "etatPMEMet": "string",
  "idArmateur": 0,
  "idNavFlotteur": 0,
  "idNavNfrRole": 0,
  "idNavPmeMet": 0,
  "jaugeBrute": 0,
  "jaugeNette": 0,
  "jaugeOslo": 0,
  "jaugeSecuritePMEMet": 0,
  "listeGenreNavigationPA": [
    {
      "bloque": true,
      "code": "string",
      "codeExport": "string",
      "dateDebutApplication": "2020-11-10T13:35:47.168Z",
      "dateFinApplication": "2020-11-10T13:35:47.168Z",
      "idCode": 0,
      "libelle": "string",
      "libelleAnglais": "string",
      "libelleCourt": "string"
    }
  ],
  "listeObjetsPMEMet": [
    "string"
  ],
  "longueurEntrePP": 0,
  "longueurHorsTout": 0,
  "longueurPMEMet": 0,
  "naturePMEMet": "string",
  "nomNavire": "string",
  "numImmat": "string",
  "numeroNavire": "string",
  "numeroPMEMet": 0,
  "numeroRole": "string",
  "objetPmeMet": "string",
  "puissancePMEMet": 0,
  "puissancePropulsivePrincipale": 0,
  "quartier": "string",
  "quartierImmat": "string",
  "raisonOuNomArmateur": "string",
  "statut": "string",
  "tonnagePMEMet": 0,
  "typeNavire": "string"
}
`)
})

app.listen(port, () => {
    console.log(`NavPro mock listening at http://localhost:${port}`)
})
