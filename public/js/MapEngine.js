// Copyright 2011 The HazardMap Authors.
// Licensed under the MIT License, see MIT-LICENSE.txt

/**
 * @fileoverview map_engine is the Engine for the HazardMap project.
 *
 * Main controller
 * @author hernanthiers@gmail.com (Hernán) gustavo@lacosox.org (Gustavo Lacoste)
 * @supported IE6+, WebKit 525+, Firefox 2+.
 * @see https://github.com/knxroot/geo_search
 */

/**
 * HazardMap class for the project.
 *
 * Vars on HazardMap reference to:
 * w the global context.  In most cases this will be 'window'.
 * d the current document.
 * config the global HAZARD_CONFIG config var, HAZARD_CONFIG is defined on
 * the layout
 * @class
 */








var MapEngine = function(w, d) {

  var GMAP = 'none';
  var markers = [];

  var _setGMAP = function(el,opts){
        GMAP = new google.maps.Map(el, opts);
  }

  var _autoFormStyle=function(form){
      //
  }
  

 var _makeLocalMarkerIcon=function(lat,lng,desc){

    var marker = new google.maps.Marker({ 
          map:  GMAP,
          draggable: false,
          icon: new google.maps.MarkerImage('http://www.google.com/help/hc/images/mapmaker_1196363_marker_for_published_feature_en.png', 
                    new google.maps.Size(34, 34), new google.maps.Point(0, 0)),
          position:  new google.maps.LatLng(lat,lng),
          title: desc
    });    

    return marker;
  }


  var _geolocationWithMaker=
    function(marker,callback){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new google.maps.LatLng('-33.45','-70.6667');
          GMAP.panTo(pos);
          GMAP.setZoom(11);
          
          marker.setPosition(pos);
          marker.setMap(GMAP);
          
          callback && callback(position);

        }, function() {
          //
        });
      }
    }


  return {
    setGMAP: function(el, opts){
        _setGMAP(el, opts);
        
    },
    getGMAP: function(){
        return GMAP;
    },
    makeLocalMarkerIcon: function (lat,lng,desc){
        _makeLocalMarkerIcon(lat,lng,desc);
    },


   generateAllPoints: function(points_json){
     $.each(points_json, function(i, item) {
 
     var punto =_makeLocalMarkerIcon(item.latitud,item.longitud,item.descripcion);
     markers.push(punto);
     /*
       var local=_makeLocalMarkerIcon(data[i]);
       markers.push(local);*/
     });
   return markers;
   },

   initMapWithResults: function (){
        
        
         var gmapOptions = {
                mapTypeId: google.maps.MapTypeId.HYBRID,
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                  position: google.maps.ControlPosition.TOP_CENTER
                },
                navigationControl: true,
                navigationControlOptions: {
                  style: google.maps.NavigationControlStyle.ZOOM_PAN,
                  position: google.maps.ControlPosition.TOP_LEFT
                },
                scaleControl: true,
                scaleControlOptions: {
                  position: google.maps.ControlPosition.BOTTOM_RIGHT
                },
                zoom: 9,
                center: new google.maps.LatLng('-33.45','-70.6667')
            };     
          this.setGMAP(document.getElementById('map_canvas'), gmapOptions);


          GMAP=this.getGMAP();


          
          
         /*GMAP.fitBounds(bound);
          */
      },   


  };



}


$().ready(function() {

/* CODIGO ORDINARIO */

function jsonHazardMap(){
//Variable de configuracion
var cantidadRegistro = 100;
var cantidadRegionRandom = 15;
//Lantitud 35,70
// Longitud 70, 130
var arrayJson = new Array();
var contador = 0;
for(contador = 1; contador <= cantidadRegistro ; contador ++) {

     var valor = {id:1, longitud : 70,  latitud: 35, descripcion: "Descripcion1"};

     var socket = io.connect('/stream');
     var connected = false;
     socket.on('connect', function() {
       connected = true;
       socket.on('tweet-list', function(tweets) {
         // this is the initial list of tweets to load the map
         console.log(tweets);
         valor.id = tweets.id;
         valor.longitud  = tweets.longitud ;
         valor.latitud  = tweets.latitud ;
         valor.descripcion =  tweets.descripcion;
       });
       socket.on('new-tweet', function(newTweet) {
         // this is a new tweet that you must add to the map
         console.log(newTweet);
       });
   arrayJson.push(valor);
   //console.log(valor.longitud+" - "+valor.latitud );
}
return arrayJson;

}
/* codigo ordinario fin*/




/*Creando el mapa con puntos*/
var b=MapEngine(this, this.document);
b.initMapWithResults();
b.makeLocalMarkerIcon();
var markers=b.generateAllPoints(jsonHazardMap());

/*Clusterizando*/
var mcOptions = {
  gridSize: 50, 
  maxZoom: 17  
};

mc = new MarkerClusterer(b.getGMAP(), markers , mcOptions);





});
