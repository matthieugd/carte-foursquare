function convertasbinaryimage() {
    html2canvas(document.getElementById("map"), {
        useCORS: true,
		backgroundColor: null
    }).then(canvas => {
		var img = canvas.toDataURL("image/png", { pixelRatio: 3 });
        img = img.replace('data:image/png;base64,', '');
        var finalImageSrc = 'data:image/png;base64,' + img;
        document.getElementById("googlemapbinary").src = finalImageSrc;
	});
}
	
function convertasvgimage() {

	htmlToImage.toSvg(document.getElementById('map'),)
	.then(function (dataUrl) {
		//let svg = decodeURIComponent(dataUrl.split(',')[1])
		//console.log(svg);
		//document.getElementById('svg').innerHTML = svg    
		document.getElementById("googlemapbinary").src = dataUrl;
	});
}

function csvToArray(str, delimiter = ",") {

  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\r\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\r\n") + 1).split("\r\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

function addVisit(venue, venueToExtract, firstVisit) {
	
	var timestamp = Date.parse(venueToExtract.date);
	var dateObject = new Date(timestamp);
	var formattedDate = dateObject.toLocaleString('fr-CA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' });
	if(firstVisit) {
		venue.date =  formattedDate;
	}else{
		venue.date += "<br/>" + formattedDate;
	}
}

function extractVenues(data) {
	
	const checkins = data.entries();

	const venues = new Map();
	
	for (let entry of checkins) {
		
	  const checkin = entry[1];
	  //reduce checkins to unique venue 
	  if(venues.has(checkin.venueId)){
		  const venue = venues.get(checkin.venueId);
		  addVisit(venue, checkin, false);
		  venue.visitCount = venue.visitCount + 1;
	  }else{
		  checkin.visitCount = 1;
		  addVisit(checkin, checkin, true);
		  venues.set(checkin.venueId, checkin);
	  }
	}
		
	return venues;
}

const markers = new Array();
var map = null;
var clusterCheckins = null;

const clusterRenderer = {
	  render: function(cluster, stats) {
		  
			const svg =  window.btoa('<svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
			  '<circle cx="120" cy="120" opacity=".6" r="70" />' +
			  '<circle cx="120" cy="120" opacity=".3" r="90" />' +
			  '<circle cx="120" cy="120" opacity=".2" r="110" />' +
			  '<circle cx="120" cy="120" opacity=".1" r="130" />' +
		  	'</svg>');
		  
		    return new google.maps.Marker({
			  position: cluster.position,
		      icon: {
			    url: 'data:image/svg+xml;base64,' + svg,
			    scaledSize: new google.maps.Size(45, 45)
			  },
			  label: {
			    text: ""+cluster.count,
			    color: "white",
			    fontSize: "12px"
			  },
			  zIndex: 1000 + cluster.count,
		    });
		}
	};

function displayVenues(venues) {
	
	// The map centered on home
    map = new google.maps.Map(document.getElementById("map"), {
		zoom: 16,
		center: new google.maps.LatLng(45.532200, -73.595520),
		mapId: '9c38346f6206857a',
		disableDefaultUI: true
	});  
	
	
	const svgMarker = {
	    path: "M 32 8 C 22.075 8 14 16.075 14 26 C 14 32.01 16.480922 35.344109 18.669922 38.287109 C 19.450922 39.337109 20.265906 40.338437 21.128906 41.398438 C 24.049906 44.984438 27.359203 49.517969 30.033203 56.667969 C 30.388203 57.619969 31.087 58 32 58 C 32.913 58 33.611797 57.619969 33.966797 56.667969 C 36.640797 49.517969 39.951094 44.984437 42.871094 41.398438 C 43.735094 40.339438 44.549078 39.337109 45.330078 38.287109 C 47.519078 35.344109 50 32.01 50 26 C 50 16.075 41.925 8 32 8 z M 32 12 C 32.271521 12 32.551292 12.020589 32.830078 12.039062 L 26.232422 20.046875 L 21.761719 16.365234 C 24.622172 13.430251 28.627288 12 32 12 z M 35.130859 12.390625 C 39.444045 13.415539 43.887849 16.531781 45.423828 21.888672 L 39.816406 28.697266 C 39.934891 28.149593 40 27.583113 40 27 C 40 22.582 36.418 19 32 19 C 31.047522 19 30.138264 19.175008 29.291016 19.480469 L 35.130859 12.390625 z M 20.492188 17.910156 L 24.960938 21.591797 L 18.427734 29.523438 C 18.162017 28.47253 18 27.313484 18 26 C 18 22.706529 18.979272 20.025219 20.492188 17.910156 z M 32 21 C 35.314 21 38 23.686 38 27 C 38 30.314 35.314 33 32 33 C 28.686 33 26 30.314 26 27 C 26 23.686 28.686 21 32 21 z M 45.916016 24.435547 C 45.965737 24.942697 46 25.46071 46 26 C 46 32.01 42.490734 35.331437 40.302734 38.273438 C 39.521734 39.323437 38.796969 40.361203 37.917969 41.408203 C 37.078969 42.410203 34.173594 47.128031 32.433594 50.332031 C 32.219594 50.727031 32.152 51.275391 32 51.275391 C 31.848 51.275391 31.868078 50.953422 31.580078 50.357422 C 30.457023 48.029181 29.567563 46.485677 28.769531 45.25 L 45.916016 24.435547 z M 24.101562 25.78125 C 24.040477 26.179692 24 26.584483 24 27 C 24 31.418 27.582 35 32 35 C 33.123152 35 34.19018 34.76554 35.160156 34.347656 L 27.589844 43.539062 C 27.086254 42.841934 26.590624 42.166605 26.070312 41.419922 C 25.288312 40.298922 23.988031 38.690625 23.207031 37.640625 C 21.891039 35.87134 20.28638 34.102405 19.207031 31.724609 L 24.101562 25.78125 z",
	    fillColor: "red",
	    fillOpacity: 1.0,
	    strokeWeight: 1.0,
		strokeColor: "red",
	    rotation: 0,
	    scale: 0.5,
		scaledSize: 0.5,
	    anchor: new google.maps.Point(25, 60),
	};
	
	venues.forEach (function(venue, key) {
		
  		const marker = new google.maps.Marker({
		    position: new google.maps.LatLng(venue.lat, venue.long),
			icon: svgMarker
		});
		
		
		marker.addListener("click", () => {
			
			const contentString =
			    '<div id="venueContent">' +
				    '<h3>' + venue.venueName + '</h3>' +
					'<p>' + venue.visitCount + ' visite(s).</p>' +
					'<p>' + venue.date + '</p>' +
			    "</div>";
				
			const infowindow = new google.maps.InfoWindow({
			    content: contentString,
			});
			
		    infowindow.open({
		      anchor: marker,
		      map,
		      shouldFocus: false,
		    });
		});
		
		markers.push(marker);
		
	});
	
	//clusterCheckins = new markerClusterer.MarkerClusterer({ markers, map, renderer: clusterRenderer });
	
	return map;
}

function colorCountries(map, venues) {
	
	if (map.getMapCapabilities().isDataDrivenStylingAvailable) {
		
		//project countries
		const countriesList = Array.from(venues.values()).map(v => v.country);
		const countries = new Set(countriesList);
		
		const featureLayer = map.getFeatureLayer(google.maps.FeatureType.COUNTRY);
		
		featureLayer.style = function(placeFeature) {
			
			//console.log(placeFeature.feature.displayName);
			if(countries.has(placeFeature.feature.displayName)) {
				return {
			      fillColor: "red",
			      fillOpacity: 0.1
		 		 };
				 
			}else {
				return null;
			}
		};
	}else {
		console.log('not data driven enabled');
	}
}

function initVenues(venuesAsText) {
	
	const data = csvToArray(venuesAsText);
	const venues = extractVenues(data);
	const map = displayVenues(venues);
	colorCountries(map, venues);
}

function loadData(input){
	const reader = new FileReader();
	let file = input.files[0];
	
	reader.onload = function (e) {
		const text = e.target.result;
		initVenues(text);
		
	};
	      
	reader.readAsText(file);
}

function download(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.csv', true);
    xhr.responseType = 'text';

    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
            var percentComplete = (event.loaded / event.total)*100;
            //yourShowProgressFunction(percentComplete);
        } 
    };

    xhr.onload = function(event) {
        if (this.status == 200) {
			initVenues(this.response);
        }
        else {
            //yourErrorFunction()
        }
    };

    xhr.onerror = function(event){
        //yourErrorFunction()
    };

    xhr.send();
}

// Initialize and add the map
function initMap() {
	download();
}

function toggleVenuesDisplay() {
  // Get the checkbox
  var venueVisibility = document.getElementById("venuesVisibility");

  // If the checkbox is checked, display the output text
  if (venueVisibility.checked == true){
	clusterCheckins.addMarkers(markers);
  } else {
	clusterCheckins.removeMarkers(markers);
  }
}

window.initMap = initMap;
window.loadData = loadData;
window.toggleVenuesDisplay = toggleVenuesDisplay;
window.convertasbinaryimage = convertasbinaryimage;
window.convertasvgimage = convertasvgimage;