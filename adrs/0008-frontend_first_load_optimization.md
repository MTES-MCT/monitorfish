# Optimisation du premier chargement de l'application Frontend

Date: 2024-10-01

## Statut

Proposition

## Contexte

### Proposition 1 - Séparater le bundle de BackOffice du bundle principal

#### Avant

```sh
➜  frontend git:(master) npm run build

✓ 4934 modules transformed.
build/index.html                                    2.28 kB │ gzip:     1.04 kB
build/assets/MonitorFishWebWorker-D86GuQRD.js      78.38 kB
build/assets/index-CYpSx5zc.css                   442.36 kB │ gzip:    55.75 kB
build/assets/index-CfgwUvEZ.js                 11,269.00 kB │ gzip: 2,369.71 kB │ map: 21,778.63 kB
✓ built in 38.08s
```

#### Après

```sh
➜  frontend git:(master) ✗ npm run build

✓ 4938 modules transformed.
build/index.backoffice.html                        2.24 kB │ gzip:     1.00 kB
build/index.html                                   2.37 kB │ gzip:     1.07 kB
build/assets/MonitorFishWebWorker-D86GuQRD.js     78.38 kB
build/assets/rsuite-override-CYpSx5zc.css        442.36 kB │ gzip:    55.75 kB
build/assets/index.backoffice-Dn8Ips9U.js        207.76 kB │ gzip:    40.40 kB │ map:    349.94 kB
build/assets/index-CJZnXlyb.js                 3,026.02 kB │ gzip:   588.76 kB │ map:  5,740.80 kB
build/assets/rsuite-override-DXirIGCf.js       7,046.93 kB │ gzip: 1,716.01 kB │ map: 15,572.26 kB
✓ built in 30.26s
```

### Proposition 2 - Remplacer l'image de fond au chargement par un CSS-in-HTML

...

## Résultats

- Perf : Lighthouse Performance Score
- FCP : First Contentful Paint
- LCP : Largest Contentful Paint
- TBT : Total Blocking Time

| Perf - FCP - LCP - TBT | Essai 1              | Essai 2              | Essai 3              | Essai 4              | Moyenne                  |
| ---------------------- | -------------------- | -------------------- | -------------------- | -------------------- | ------------------------ |
| A                      | 40 - 2.2 - 5.3 - 480 | 38 - 2.2 - 5.3 - 530 | 36 - 2.2 - 5.3 - 610 | 40 - 2.2 - 5.3 - 470 | 38.5 - 2.2 - 5.3 - 522.5 |
| B                      | 42 - 2.2 - 5.2 - 440 | 41 - 2.2 - 5.3 - 450 | 40 - 2.2 - 5.2 - 510 | 45 - 2.2 - 5.2 - 370 | 42.0 - 2.2 - 5.2 - 442.5 |
| C                      | 44 - 2.2 - 4.9 - 420 | 48 - 2.2 - 4.2 - 360 | 47 - 2.1 - 4.2 - 390 | 42 - 2.2 - 5.0 - 460 | 45.3 - 2.2 - 4.6 - 407.5 |

## Décision

...

## Conséquences

...
