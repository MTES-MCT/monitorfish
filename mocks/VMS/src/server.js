var cron = require('node-cron');
var request = require('request');
const logger = require('./logger');
const randomLocation = require('random-location')

var nbExecution = 0;

const stubs = require("./stubs.json")
const stubsCFR = require("./cfr_stubs.json")

logger.info("API_URL is : " + process.env.API_URL);
logger.info("PORT is : " + process.env.PORT);

let generateRandomNAF = function() {
	const countries = ["AUT", "FRA", "BGR", "CUB", "CIV", "FIN", "FRA", "PYF", "IRL", "DEU", "GLP"];
	const randomFromCountry = countries[Math.floor(Math.random() * countries.length)];
	const randomDestinationCountry = countries[Math.floor(Math.random() * countries.length)];
	const randomFlagCountry = countries[Math.floor(Math.random() * countries.length)];

	const dateTime = new Date()
		
	const date = dateTime
		.toISOString()
		.substr(0, 10)
		.replace(/-/g, '');

	const hrs = dateTime.getHours();
	const mins = dateTime.getMinutes();
	const time = (hrs < 10 ? "0" + hrs : hrs) + "" + (mins < 10 ? "0" + mins : mins);

	const randomPoint = randomLocation.randomCirclePoint({latitude:45.9602075,longitude:-19.3276946}, 180000000)

	const speed = Math.floor(Math.random() * 10);
	const course = Math.floor(Math.random() * 360);

	const internalNumber = stubsCFR.cfr[Math.floor(Math.random() * stubsCFR.cfr.length)]
	let IRCS = Math.random().toString(36).substring(5);

	const naf = `//SR//AD/${randomDestinationCountry}//FR/${randomFromCountry}//RD/${date}//RT/2141//FS/${randomFlagCountry}//RC/${IRCS}//IR/${internalNumber}//DA/${date}//TI/${time}//LT/${randomPoint.latitude}//LG/${randomPoint.longitude}//SP/${speed}//CO/${course}//TM/POS//ER//`
	logger.info(naf)
	return naf	
};

let formatRequest = function () {
	return requestOptions = {
		url: process.env.API_URL + ':' + process.env.PORT + '/api/v1/positions',
		method: 'POST',
		body: generateRandomNAF(),
		contentType: "application/text"
	};
}

let postMeasures = function (options) {
	request(options, function (err, res, body) {
		if (err != null) {
			logger.error(options.url + " KO : " + err);
		} else {
			if (res.statusCode === 201) {
				logger.info(options.url + " OK : " + res.statusCode);
			} else {
				logger.error(options.url + " KO : " + res.statusCode, res.body);
			}
		}
	});
};

cron.schedule('* * * * * * *', () => {
	nbExecution = nbExecution + 1;
	logger.info('Number of calls : ' + nbExecution);
	postMeasures(formatRequest());
}, {
	scheduled: true
});
