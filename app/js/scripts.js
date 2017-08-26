var app = {};
var myChart;
app.baseUrl = "https://api.teleport.org/api";
app.googleApiKey = "AIzaSyDhziRsGb0kP7XJOlu94x94WTcJ3ghwZOQ";
app.weatherApiKey = "36dcbd995ae016fd693d2850b085e655";

Chart.defaults.global.repsonsive = true;

app.events = function(){
	//Auto Complete Bar courtesy of Teleport.
	TeleportAutocomplete.init('.my-input').on('change', function(value) {
		// console.log(value);

		var basicCityInfo = value
		console.log(basicCityInfo);
		if (value.uaSlug) {
			var slugId = value.uaSlug;
			app.urbanAreaInfo(slugId, basicCityInfo);
		} else {
			let err = "There is no startup information in this city.";
			app.displayData(null,err);
		}
	});


	$("form").on('submit', function(e){
		e.preventDefault();
	})
}
app.urbanAreaInfo = function (slug, basicCityInfo) {

	var urbanUrl = app.baseUrl + "/urban_areas/" + "slug:" + slug +"/";

	$.ajax({
		type: "GET",
		dataType: "json",
		url: urbanUrl
	}).then(function(res) {
		console.log(res);
		let imageUrl = res._links["ua:images"].href;
		let scoresUrl = res._links["ua:scores"].href;
		let detailsUrl = res._links["ua:details"].href;
		app.parseData(basicCityInfo, imageUrl, scoresUrl, detailsUrl);
	})
}

app.parseData = function( basicCityInfo , imageUrl, scoresUrl, detailsUrl) {

	let weatherUrl = "http://api.openweathermap.org/data/2.5/weather?"

	let call1 = $.ajax({
		type: "GET",
		dataType: "json",
		url: imageUrl
	});

	let call2 = $.ajax({
		type: "GET",
		dataType: "json",
		url: scoresUrl
	});

	let call3 = $.ajax({
		type: "GET",
		dataType: "json",
		url: detailsUrl
	});

	let call4 = $.ajax({
		type: "GET",
		dataType: "json",
		url: weatherUrl,
		data: {
			q:basicCityInfo.name,
			units: "metric",
			appid: app.weatherApiKey
		}
	})

	$.when(call1, call2, call3, call4).done(function(res1, res2, res3, res4){
		var images = res1[0].photos[0].image.web;
		var summary = res2[0].summary;
		var details = res3[0];
		console.log(details);
		console.log(res4[0]);
		var avgTemp = parseInt(res4[0].main.temp);
		var weatherDescription = res4[0].weather[0].description;
		var iconTemp = "http://openweathermap.org/img/w/" + res4[0].weather[0].icon + ".png";

		//Checks array values and injects content in if there is none
		function noDataFiller(array, index, id) {
			if( index === -1 ) {
				let a = {id: id, 
						int_value: 0,
						string_value: "There is no data."
						}
				array.push(a);
				return array[array.length - 1];
			} else {
				return array[index];
			}
		}

		let startupIndex = details.categories.findIndex(function(el) {
			return el.id === "STARTUPS";
		});
		let startupInfo = details.categories[startupIndex].data

		let startupNumIndex = startupInfo.findIndex(function(el) {
			return el.id === "FUNDERBEAM-TOTAL-STARTUPS";
		});

		let startupNum = noDataFiller(startupInfo, startupNumIndex, "FUNDERBEAM-TOTAL_STARTUPS").int_value;

		let startupNumIndex2 = startupInfo.findIndex(function(el) {
			return el.id === "STARTUP-CLIMATE-NEW-STARTUPS";
		});

		let startupMonthlyDif = noDataFiller(startupInfo, startupNumIndex2,"STARTUP-CLIMATE-NEW-STARTUPS").int_value;

		let startupNumIndex3 = startupInfo.findIndex(function(el) {
			return el.id === "STARTUP-CLIMATE-INVESTORS";
		});

		let startupMonthlyInvestors = noDataFiller(startupInfo, startupNumIndex3, "STARTUP-CLIMATE-INVESTORS").int_value;

		let startupNumIndex4 = startupInfo.findIndex(function(el) {
			return el.id === "EVENTS-LAST-12-MONTHS";
		});

		let startupEvents = noDataFiller(startupInfo, startupNumIndex4, "EVENTS-LAST-12-MONTHS").int_value;

		//------------------------------------------------------------------------------------------------------------------

		let ventureIndex = details.categories.findIndex(function(el) {
			return el.id === "VENTURE-CAPITAL";
		});
		let ventureInfo = details.categories[ventureIndex].data;

		let ventureNumIndex = ventureInfo.findIndex(function(el) {
			return el.id === "FUNDING-ACCELERATOR-NAMES";
		});

		let ventureAccelNames = noDataFiller( ventureInfo, ventureNumIndex, "FUNDING-ACCELERATOR-NAMES").string_value;

		let ventureNumIndex2 = ventureInfo.findIndex(function(el) {
			return el.id === "FUNDING-ACCELERATORS-DETAIL";
		});

		let ventureAccelDetails = noDataFiller( ventureInfo, ventureNumIndex2, "FUNDING-ACCELERATORS-DETAIL").int_value;

		let jobMarketIndex = details.categories.findIndex(function(el) {
			return el.id === "JOB-MARKET";
		});
		let jobMarketInfo = details.categories[jobMarketIndex].data

		let startupJobIndex = jobMarketInfo.findIndex(function(el) {
			return el.id === "STARTUP-JOBS-AVAILABLE"
		})

		let startupJobsAvail = noDataFiller(jobMarketInfo, startupJobIndex, "STARTUP-JOBS-AVAILABLE").int_value;


		//Google Maps Location Parsing

		let googleMapProp = {
			center: {
				lat: basicCityInfo.latitude,
				lng: basicCityInfo.longitude
			},
			zoom: 10,
			disableDefaultUI: true,
			styles: [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
]
		}

		//information from different ajax calls are sent to the view function
		let results = {
			basicCityInfo: basicCityInfo,
			summary: summary,
			images: images,
			details: details,
			startupInfo: startupInfo,
			startupNum: startupNum,
			startupMonthlyDif: startupMonthlyDif,
			startupMonthlyInvestors: startupMonthlyInvestors,
			startupEvents: startupEvents,
			ventureAccelNames: ventureAccelNames,
			ventureAccelDetails: ventureAccelDetails,
			avgTemp: avgTemp,
			iconTemp: iconTemp,
			weatherDescription: weatherDescription,
			googleMapProp: googleMapProp,
			startupJobsAvail: startupJobsAvail
		}
		app.displayData(results)
	})
}

app.displayData = function(results, err) {
	console.log(results);
	// console.log(err);
	$(".no__info").empty();
	$(".show__info").empty();
	$(".details__info").empty();

	//Google maps running and 
	let map;
		map = new google.maps.Map(document.getElementById('google__map'), results.googleMapProp);
	let marker = new google.maps.Marker({
		position: results.googleMapProp.center,
		map: map,
		title: results.basicCityInfo.title
	});

	//Grabs index with Id of STARTUPS
	if (results) {

		let cityImage = $("<img>").addClass("city__image").attr('src', results.images)

		let title = $("<h3>").addClass("city__title").text(results.basicCityInfo.title);
		let description = $("<div>").addClass("city__description").html(results.summary);

		let container = $("<div>").addClass("city__container").append(title, description);

		let population = $("<h3>").addClass("population__detail").text("Population:" +  results.basicCityInfo.population);

		let startupNumbers = $("<p>").addClass("startup__numbers").append(`Startups in ${results.basicCityInfo.name}: ${results.startupNum}`);

		let startupJobNum = $("<p>").addClass("startup__jobnum").append(`Start up jobs available: ${results.startupJobsAvail}`)

		let startupChanges = $("<p>").addClass("startup__changes").append(`Average monthly increase in number of startups: ${results.startupMonthlyDif}`);

		let investorNum = $("<p>").addClass("start__investors").append(`Number of Investors: ${results.startupMonthlyInvestors}`);

		let startupEvents = $("<p>").addClass("startup__events").append(`Number of startup events in the last 12 months: ${results.startupEvents}`);

		let acceleratorNames = $("<p>").addClass("accelerator__names").append(`These are some of the funding accelerators in <strong>${results.basicCityInfo.name}:</strong> ${results.ventureAccelNames}`);

		let acceleratorNum = $("<p>").addClass("accelerator__num").append(`Number of funding accelerators: ${results.ventureAccelDetails}`);


		$(".info__image").empty();
		$(".info__image").append(cityImage);
		$(".show__info").append(container);
		$(".details__info").append(population,startupNumbers, startupChanges, startupJobNum,investorNum, startupEvents, acceleratorNames, acceleratorNum);

		let weatherIcon = $("<img>").addClass("weather__icon").attr('src',results.iconTemp);
		let weatherDescription = $("<p>").addClass("weather__description").append(`Current weather condition: ${results.weatherDescription}`)

		let weatherTemp = $("<p>").addClass("weather__temp").append(`Current: ${results.avgTemp}&#8451;`);


		$(".weather__container").empty();
		$(".weather__container").append(weatherIcon, weatherDescription, weatherTemp);
		//shows Value to the side solution grabbed from stackoverflow
		
		Chart.plugins.register({
		      afterDatasetsDraw: function(chartInstance, easing) {
		          // To only draw at the end of animation, check for easing === 1
		          var ctx = chartInstance.chart.ctx;

		          chartInstance.data.datasets.forEach(function (dataset, i) {
		              var meta = chartInstance.getDatasetMeta(i);
		              if (!meta.hidden) {
		                  meta.data.forEach(function(element, index) {
		                      // Draw the text in black, with the specified font
		                      ctx.fillStyle = 'rgb(100, 100, 100)';

		                      var fontSize = 16;
		                      var fontStyle = 'normal';
		                      var fontFamily = 'Helvetica Neue';
		                      ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

		                      // Just naively convert to string for now
		                      var dataString = dataset.data[index].toString();

		                      // Make sure alignment settings are correct
		                      ctx.textAlign = 'left';
		                      ctx.textBaseline = 'middle';

		                      var position = element.tooltipPosition();
		                      ctx.fillText(dataString, position.x + 7, position.y - (fontSize / 2) + 9);
		                  });
		              }
		          });
		      }
		  });

		if(myChart) {
			myChart.destroy();
		}

		var ctx = document.getElementById("myChart").getContext("2d");
		myChart = new Chart(ctx, {
		responsive: true,
		type: 'horizontalBar',
		data: {
			labels:[ "Number of Startups", "Average Monthly Startup Increase", "Startup Jobs", "Amount of investors", "Startup Events"],
			datasets: [{
				data:[results.startupNum, results.startupMonthlyDif, results.startupJobsAvail, results.startupMonthlyInvestors, results.startupEvents],
				backgroundColor: [
				              'rgba(255, 99, 132, 0.2)',
				              'rgba(54, 162, 235, 0.2)',
				              'rgba(255, 206, 86, 0.2)',
				              'rgba(75, 192, 192, 0.2)',
				              'rgba(153, 102, 255, 0.2)'
				          ],
				          borderColor: [
				              'rgba(255,99,132,1)',
				              'rgba(54, 162, 235, 1)',
				              'rgba(255, 206, 86, 1)',
				              'rgba(75, 192, 192, 1)',
				              'rgba(153, 102, 255, 1)'
				          ],
				         borderWidth: 1
			}]
		},
		options: {
			legend:{
				display: false
			},
			scales:{
				yAxes:[{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
		
	})
		$(".city__description p:last").remove();

	} else {
		$(".no__info").append(err);
	}

}

app.init = function () {
	app.events();
}

$(function() {
	app.init();

})