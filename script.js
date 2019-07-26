// JavaScript source code
let datosInfo = []
const traerDatos = () =>{

	//console.log('dentro de la funcion');

	const xhttp = new XMLHttpRequest();
	xhttp.open('GET', 'parquesChapinero.json', true);
	xhttp.send();
	xhttp.onreadystatechange = function(){
	
		if(this.readyState == 4 && this.status == 200){
		
			let datos = JSON.parse(this.responseText);
			//console.log(datos);

			

			//Construccion del arrreglo que contiene todos los datos que provee el JSON
			
			datos.forEach(dato =>{
				let datoInfo = {
					posicion: {lat:parseFloat(dato.coord_y), lng:parseFloat(dato.coord_x)},
					nombre: dato.NombreParque
				}
				datosInfo.push(datoInfo)
				//console.log(datosInfo)
			})

			

			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(usuarioUbicacion => {
					let ubicacion = {
						lat:usuarioUbicacion.coords.latitude,
						lng:usuarioUbicacion.coords.longitude
					}
					dibujarMapa(ubicacion)
				})
			}

		}

	}

}

const dibujarMapa = (obj) =>{

	let mapa = new google.maps.Map(document.getElementById('map'),{
		center:obj,
		zoom:12,
		styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
	})

	let marcadorUsuario = new google.maps.Marker({
		position:obj,
		title:'Tu ubicacion'
	})

	marcadorUsuario.setMap(mapa)
	
	var markerIcon = {
		url: 'img/001-park.png',
		size: new google.maps.Size(40, 60), 
		origin: new google.maps.Point(0,0), 
		anchor: new google.maps.Point(20, 60)
	}

	let marcadores = datosInfo.map(dato => {
		//console.log(dato.posicion);
		return new google.maps.Marker({
			position: dato.posicion,
			title:dato.nombre,
			map:mapa,
			icon : markerIcon
		})
	})

	//Creacion de los marcadores

	var indice = 0;
	for(let item of marcadores){
		attachSecretMessage(item, datosInfo[indice].nombre);
		indice++;
	}
	
	function attachSecretMessage(marc, msj) {
			var infowindow = new google.maps.InfoWindow({
			content: msj
		});
	
		marc.addListener('click', function(){
			//console.log(marc.getPosition().lng());
			infowindow.open(marc.get('map'), marc);
			var posicionMarcador = new google.maps.LatLng(marc.getPosition().lat(), marc.getPosition().lng());
			//console.log(posicionMarcador);
			crearRuta(posicionMarcador);
			inicializar(posicionMarcador);
		});
	}

	//Funcion del street view

	function inicializar(posicionMarcador){
		console.log("Entro a la funcion StreetViewPanorama");
		var fenway = posicionMarcador;
		mapa.center= fenway;
		mapa.zoom= 14;
		var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), {
			position: fenway,
			pov: {
				heading: 34,
				pitch: 10
			}
		});
		mapa.setStreetView(panorama);
		console.log("Probablemente dibujo el StreetViewPanorama");
	}

	//Creacion de la ruta
	
	function crearRuta(posicionMarcador){

		console.log("Entro a crearRuta");

		var posicionUsuario = new google.maps.LatLng(obj.lat, obj.lng);

		var objConfigDR = {
			map:mapa
		}

		var objConfigDS = {
			origin: posicionUsuario,
			destination: posicionMarcador,
			travelMode: google.maps.TravelMode.WALKING
		}

		var ds = new google.maps.DirectionsService(); //Obtiene las coordenadas
		var dr = new google.maps.DirectionsRenderer(objConfigDR);	//Traduce las coordenadas a una ruta visible

		ds.route(objConfigDS, fnRutear);

		//Mostrar la linea entre A y B
		function fnRutear(resultados, status){
			if(status == 'OK'){
				dr.setDirections(resultados);
			}else{
				alert('Error'+status);
			}
		}

	}

}

traerDatos()