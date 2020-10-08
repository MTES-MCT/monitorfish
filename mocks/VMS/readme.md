This tool mock IOT Platform and send random sensors measures to Airquality backend.  
Need :
* API_URL
* PORT
* API_KEY

Example Of message sended by API :

```
"applicationID": "2",
	"applicationName": "livin-it",
	"deviceName": "fakeDeviceName",
	"devEUI": "70b3d54999e58f05",
	"rxInfo": [{
		"gatewayID": "7276ff000b031703",
		"name": "fakeName",
		"time": "2019-04-16T14:31:55.003Z",
		"rssi": -111,
		"loRaSNR": 6.5,
		"location": {"latitude": 0, "longitude": 0, "altitude": 0}
	}],
	"txInfo": {"frequency": 868500000, "dr": 5},
	"adr": true,
	"fCnt": 66,
	"fPort": 2,
	"data": "AAAAAAAAAAKcZAECnGQCAgbcAGcA4ABoUQBzJ4A=",
	"object": {
		"digitalInput": {"0": 0},
		"analogInput": {"0": -255, "1": -255, "2": 32},
		"temperatureSensor": {"0": 12},
		"humiditySensor": {"0": 7},
		"barometer": {"0": 950}
	}
```