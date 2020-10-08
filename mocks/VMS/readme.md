## VMS

This tool mocks a VMS service and sends NAF messages.

> See: [North Atlantic Format](http://www.naf-format.org/)

Required environment variables:
* `API_URL`
* `PORT`

Example of message sent by the service:
```
//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER
```

### Run

From this folder, run:
```
$> npm start
```