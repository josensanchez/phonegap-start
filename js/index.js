/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
L.Icon.Default.imagePath = 'img/';
var map = L.map('map').setView([-34.58015376211612, -58.41490745544433  ], 13);
L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2012 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707'
}).addTo(map);

var RedIcon = L.Icon.Default.extend({
    options: {iconUrl: 'img/marker-icon-red.png' }
 });
var redIcon = new RedIcon();

var UsuarioIcon = L.Icon.Default.extend({
           options:{iconUrl:'img/technician-icon.png'}
           //options: {iconUrl: 'assets/images/marker-icon-red.png' }
       });
var usuarioIcon = new UsuarioIcon();

var app = {
    myMarker: null,
    timerId: null,
    idTecnico: null,
    visitas: null,
    vibrate: function(){
        if(typeof(cordova.exec) == typeof(Function))
          navigator.notification.vibrate(100);  
    },
    beep: function(){
        //if(typeof(cordova.exec) == typeof(Function))
          navigator.notification.beep();
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.goTo("login");
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.beep();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    goTo: function(page){
        $(".page").hide();
        $("#"+page).show(500);
    },
    server: "http://192.168.0.35/visitas/acciones.php",
    uriEncuesta: "http://192.168.0.35/visitas/drafts/encuesta_edit.php",
    login: function(){
        var strUsuario = $('#nombre').val();
        var strClave = $('#clave').val();
        $.ajax({url: app.server, dataType: 'json', data: {accion:"login",nombre: strUsuario, clave: strClave}, success: function(data) {
            if(data.estado=='OK'){
                geo.WatchPosition();
                app.idTecnico = data.tecnico;
                app.goTo("mapa");
                app.timerId = setInterval(app.updateState,5000);
                app.updateState();
            }else{
                alert(data.estado);
            }
        }});
    },
    updateState: function(){
        app.getVisitas(false);
        app.updateMarker();
    },
    updateMarker: function(){
        if(!geo.position) return;
        var loc = new L.LatLng(geo.position.lat, geo.position.lng);
        if(!app.myMarker){
            app.myMarker = L.marker(loc, {icon: usuarioIcon});
            map.addLayer(app.myMarker);
        }else{
            app.myMarker.setLatLng(loc);
            map.setView([loc.lat, loc.lng], 13);
        }
    },
    clearMap: function(){
        for(i in map._layers) {
            if(map._layers[i]._path != undefined) {
                try {
                map.removeLayer(map._layers[i]);
                }
                catch(e) {
                console.log("problem with " + e + map._layers[i]);
                }
            }
        }
        app.myMarker = null;
    },
    toShow: false,
    getVisitas: function(blnShow){
        app.toShow = blnShow;
        $.ajax({url: app.server, dataType: 'json', data: {accion:"visitas",tecnico: app.idTecnico}, success: function(data) {
            if(data.estado=='OK'){
                app.clearMap();
                app.updateMarker();
                var oldVisitas = app.visitas; 
                app.visitas = data.visitas;
                var visitas_html = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Buscar Visitas..." data-count-theme="b" data-inset="true">';
                for(var i = 0; i < app.visitas.length; i++){
                    visita = app.visitas[i];
                    var loc = new L.LatLng(visita.lat, visita.lng);
                    visiMarker = L.marker(loc, {icon: redIcon});
                    map.addLayer(visiMarker);
                    var intDistancia = geo.getDistance(geo.position, visita);
                    var strDistancia = (""+intDistancia).substring(0,4);
                    visitas_html +='<li><a href="#" onClick="app.verVisita('+i+')">'+visita.direccion+'<span class="ui-li-count">'+ strDistancia +' km</span></a></li>';
                }
                $("#list_visitas").html(visitas_html+'</ul>').trigger('create');
                if(app.toShow || oldVisitas.length < app.visitas.length){
                    app.goTo("visitas");
                    if(oldVisitas.length < app.visitas.length){
                        app.beep();
                    }
                }
            }else{
                alert(data);
            }
        }});
    },
    loadURLEncuesta: function(id_visita){
        navigator.app.loadUrl(app.uriEncuesta + "?id_visita=" + id_visita, { openExternal:true });
        return false;
    },
    verVisita: function(idxVisita){
        app.goTo("visita");
        visita = app.visitas[idxVisita];
        $("#item_visita").html('<ul data-role="listview" data-inset="true"><li class="ui-field-contain"><label for="direccion">Direccion:</label><input name="direccion" id="direccion" value="'+ visita.direccion +'" data-clear-btn="true" type="text"></li><li class="ui-field-contain"><label for="nombre">Cliente:</label><input name="nombre" id="nombre" value="'+ visita.nombre_cliente +'" data-clear-btn="true" type="text"></li><li class="ui-field-contain"><label for="telefono">Telefono:</label><a name="telefono" id="telefono" href="tel:'+ visita.telefono_cliente +'" data-clear-btn="true" type="text">'+ visita.telefono_cliente +'</a></li><li class="ui-field-contain"><label for="textarea2">Observaciones:</label><textarea cols="40" rows="8" name="textarea2" id="textarea2">'+visita.observaciones+'</textarea></li><li class="ui-field-contain"><a target="_blank" name="ir" id="ir" href="#" onClick="app.loadURLEncuesta('+visita.id_visita+');" data-clear-btn="true" >Competar Encuesta</a></li></ul>').trigger("create");
    }
};