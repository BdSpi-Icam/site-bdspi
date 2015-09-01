function MapCtrl ($scope, $http, GeolocationService) {

	////////////////////////////////
	// Variables & Initialisation //
	////////////////////////////////
		$scope.Math = Math;
		$scope.panneau = 0;
		$scope.loader = false;

		var map,
			curPos = null,
			curPosMarker = null,
			curPosCircleAccuracy = null

		var directionsDisplay,
			directionsService = new google.maps.DirectionsService();
		var startPos,	// 45,50281   	-73,61756	UnivMtl
			destPos		// 45,50397   	-73,57136   McGill
		var destMarker,
			markers=[];
		var watchId,
			tracking=false;

	/////////////////////////////////////////////
	// Fonction principale appelée en premier //
	/////////////////////////////////////////////
		$scope.geolocate = function(){
			$scope.loader = true;
			GeolocationService.getCurrentPosition(function(position){
				$scope.panneau = 1;
				var mapOptions = {
					zoom: 16,
					streetViewControl: false,
					mapTypeControl: false,
				};
				map = new google.maps.Map(document.getElementById('map-canvas'),
					mapOptions);
				initCurLocMarker(position.coords);
				startPos = curPos;
				map.setCenter(startPos);
				
				google.maps.event.addListener(map, "click", leftclick);
				$scope.loader = false;
			}, function(error){
				$scope.loader = false;
				alert('Impossible de recuperer votre position.');
			});
		}

	//////////////////////////////////////////////////////////
	// Fonctions pour s'occuper du choix de la destination //
	//////////////////////////////////////////////////////////
		/**
		 * quand on clique sur la carte, on récupère les informations sur le point choisi
		 * @param  event objet de la carte qui contient nottement latLng.
		 */
		leftclick = function(event){
			stopTracking();
			destPos = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
			deleteMarkers();
			initializeDirection();
			calcRoute();
			startTracking();
		}
		/** On réinitialise les trajets en effacant au besoin les précédents */
		function initializeDirection() {
			if (directionsDisplay != null){
				directionsDisplay.setMap(null);
			}
			directionsDisplay = new google.maps.DirectionsRenderer();
			directionsDisplay.setMap(map);
		}
		/** On calcule la nouvelle route vers la nouvelle destination */
		function calcRoute() {
			var request = {
				origin:startPos,
				destination:destPos,
				travelMode: google.maps.TravelMode.TRANSIT
			};
			directionsService.route(request, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(result);
					var leg = result.routes[0].legs[0];
					for (var i = leg.steps.length- 1; i >= 0; i--) {
						if(leg.steps[i].travel_mode == google.maps.TravelMode.TRANSIT){
							var transit_info=leg.steps[i].transit;
							var dep_point=transit_info.departure_stop.location;
							var texte = 'Departure from ' + transit_info.departure_stop.name + ' stop at ' +transit_info.departure_time.text + ' with line '+transit_info.line.short_name +', ' + transit_info.line.name  +' <br> '+ transit_info.num_stops + ' stops to destination' ;
							texte = '<span style="color:#000000"> ' + texte + '</span>';
							addInfoWindow(dep_point,texte);
						}

					};
				}
			});
		}

	///////////////////////////////////////////////////////////////////
	// Fonctions pour gèrer le Tracking de l'appareil en temps réel //
	///////////////////////////////////////////////////////////////////
		/** Lancer le tracking et la MAJ en temps réel de la localisation de l'appareil */
		function startTracking(){
			tracking=true;
			watchID = GeolocationService.watchPosition(successGeoCB, errorGeoCB, { timeout: 30000 });
		}
		/**
		 * Si on réussi bien à récupérer la position, on mettre à jour celle-ci, et vérifier si l'on est dans un trajet si l'on est proche de l'arrivée
		 * @param position GPS qui comprend nottement l'objet coords
		 */
		function successGeoCB(position) {
			updateCurLocMarker(position.coords);

			if(google.maps.geometry.spherical.computeDistanceBetween(curPos,destPos) < 100)
				alert('Vous êtes bientôt arrivé !');

			deleteMarkers(); // On cache les markers que l'on avait peut être de présent sur la carte lors du choix de la destination
		}
		/**
		 * onError Callback receives a PositionError object
		 * @param  PositionError object
		 */
		function errorGeoCB(error) {
		    alert('code: '    + error.code    + '\n' +
		          'message: ' + error.message + '\n');
		}
		/** On arrête le traking */
		function stopTracking(){
			if(tracking){
				deleteMarkers();
				GeolocationService.clearWatch(watchID);
				watchID=null;
			}
			tracking=false;
		}

	////////////////////////////////////////////////////////////////////
	// Fonctions pour interagir avec le Marker localisation courante //
	////////////////////////////////////////////////////////////////////
		/**
		 * Initialisation du Marker localisation courante
		 * @param  position.coords coords
		 */
		function initCurLocMarker(coords) {
			curPos = new google.maps.LatLng(coords.latitude,coords.longitude);
			curPosMarker = new google.maps.Marker({
				position: curPos,
				map: map,
				icon: {
				    url: 'img/maps/curLoc24.png',
				    size: new google.maps.Size(24, 24),
				    origin: new google.maps.Point(0,0),
				    anchor: new google.maps.Point(12, 12)// The anchor for this image is the base of the flagpole at 0,32.
			  	}
			});
			// Draw a circle around the user position to have an idea of the current localization accuracy
	        curPosCircleAccuracy = new google.maps.Circle({
				center: curPos,
				radius: coords.accuracy,
				map: map,
				fillColor: '#B3D3F4',
				fillOpacity: 0.4,
				strokeColor: '#8cbae2',
				strokeOpacity: 0,
				strokeWidth:0
	        });
		}
		/**
		 * Mise à jour du Marker localisation courante
		 * @param  position.coords coords
		 */
		function updateCurLocMarker(coords) {
			if (!curPosMarker || !curPosCircleAccuracy) {
				initCurLocMarker(coords);
			}else{
				curPos = new google.maps.LatLng(coords.latitude,coords.longitude);
				curPosMarker.setPosition(curPos);
				curPosCircleAccuracy.setCenter(curPos);
				curPosCircleAccuracy.setRadius(coords.accuracy);
			};
		}
		/** Cacher de la carte le Marker localisation courante */
		function hideCurLocMarker() {
			if (curPosMarker) {curPosMarker.setMap(null)};
			if (curPosCircleAccuracy) {curPosCircleAccuracy.setMap(null)};
		}
		/** Réafficher sur la carte le Marker localisation courante */
		function showCurLocMarker() {
			if (curPosMarker) {curPosMarker.setMap(map)};
			if (curPosCircleAccuracy) {curPosCircleAccuracy.setMap(map)};
		}
		$scope.focusCurLoc = function(){
			if (curPosCircleAccuracy) {
				map.fitBounds(curPosCircleAccuracy.getBounds());
			}else{
				map.setCenter(curPos);
			};
		}

	////////////////////////////////////////////////////////////////////
	// Jeu de fonction pour ajouter des Markers sur la carte          //
	// 	Ces Marker sont enregistrés dans un tableau On pourra         //
	//  les retirer tous d'un coup sans perturber les autres markers. //
	////////////////////////////////////////////////////////////////////
		/**
		 * Add a marker to the map and push to the markers array.
		 * @param google.maps.LatLng location
		 */
		function addMarker(location) {
			var marker = new google.maps.Marker({
				position: location,
				map: map
			});
			markers.push(marker);
		}
		/**
		 * Add a marker to the map and push to the array.
		 * @param google.maps.LatLng location
		 * @param String Texte à afficher
		 */
		function addInfoWindow(location,Texte) {
			var marker = new google.maps.InfoWindow({
				position: location,
				map: map,
				content: Texte
			});
			markers.push(marker);
		}
		/**
		 * Affecter à tous nos points une carte donnée
		 * @param google.maps.Map GoogleMap sur laquelle on veut placer nos points
		 */
		function setAllMap(map) {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(map);
			}
		}
		/** Removes the markers from the map, but keeps them in the array. */
		function clearMarkers() {
			setAllMap(null);
		}
		/** Shows any markers currently in the array. */
		function showMarkers() {
			setAllMap(map);
		}
		/** Deletes all markers in the array by removing references to them. */
		function deleteMarkers() {
			clearMarkers();
			markers = [];
		}
}