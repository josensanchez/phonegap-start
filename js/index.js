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
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANYSSS
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//L.Icon.Default.imagePath = 'img/';
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

var SubwayIcon = L.Icon.Default.extend({
           options:{iconUrl:'img/railway-station-icon.gif',shadowSize:   [28, 28],shadowAnchor: [14, 27], iconSize: [28, 28], iconAnchor:   [14, 27]}
           //options: {iconUrl: 'assets/images/marker-icon-red.png' }
       });
var subwayIcon = new SubwayIcon();


var app = {
    myMarker: null,
    subwayMarker: null,
    timerId: null,
    idTecnico: null,
    visitas: null,
    strPag:"login",
    setView2Visita: false,
    vibrate: function(){
        if(typeof(navigator.notification.vibrate) == typeof(Function))
          navigator.notification.vibrate(1000);  
    },
    beep: function(){
        //if(typeof(navigator.notification.beep) == typeof(Function))
        if(navigator.notification)
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
        document.addEventListener('backbutton', this.onBackButton, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.vibrate();
        app.beep();
    },
    onBackButton: function(e){
        alert(app.strPag);
        return;
        switch(app.strPag){
            case "login":
                navigator.app.exitApp();
                break;
            case "visita":
                app.goTo("visitas");
                break;
            case "mapa":
                    navigator.notification.confirm(
                    '¿Desea finalizar la sesión?',// message
                         cerrarSesion,              // callback to invoke with index of button pressed
                    'Cerrar Sesión',            // title
                    'cancelar,Salir'          // buttonLabels
                );
                break;
            case "pasajero":
                alert("En esta versión no se permite salir de esta pantalla mientras haya un viaje aceptado.");
                break;
            case "bordo":
                alert("En esta versión no se permite salir de esta pantalla mientras haya un viaje Iniciado.");
                break;
            default:
                app.goTo("mapa");
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    goTo: function(page){
        $(".page").hide();
        $("#"+page).show(500);
        app.setView2Visita = false;
        app.strPag = page;
    },
    server: "http://josensanchez.dyndns.org/visitas/acciones.php",
    uriEncuesta: "http://josensanchez.dyndns.org/visitas/drafts/encuesta_edit.php",
    login: function(){
        var strUsuario = $('#nombre').val();
        var strClave = $('#clave').val();
        $.ajax({url: app.server, dataType: 'json', data: {accion:"login",nombre: strUsuario, clave: strClave}, success: function(data) {
            if(data.estado=='OK'){
                geo.WatchPosition();
                app.idTecnico = data.tecnico;
                app.goTo("visitas");
                $("#c3").append("<option value='"+ app.idTecnico +"' selected >"+ $("#nombre").val() +"</option>").selectmenu('refresh');
                app.timerId = setInterval(app.updateState,5000);
                app.updateState();
            }else{
                alert(data.estado);
            }
        }});
    },
    updateState: function(){
        console.log("updateState");
        app.updateMarker();
        app.getVisitas(false);
    },
    updateMarker: function(){
        if(!geo.position) return;
        var loc = new L.LatLng(geo.position.lat, geo.position.lng);
        if(!app.myMarker){
            app.myMarker = L.marker(loc, {icon: usuarioIcon});
            map.addLayer(app.myMarker);
        }else{
            app.myMarker.setLatLng(loc);
        }
        if(!app.setView2Visita)
            map.setView([loc.lat, loc.lng], 13);
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
        app.subwayMarker = null;
    },
    toShow: false,
    getVisitas: function(blnShow){
        app.toShow = blnShow;
        $.ajax({url: app.server, dataType: 'json', data: {accion:"visitas",tecnico: app.idTecnico, lat: geo.position.lat, lng: geo.position.lng}, success: function(data) {
            if(data.estado=='OK'){
                var oldVisitas = app.visitas; 
                app.visitas = data.visitas;
                var visitas_html = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Buscar Visitas..." data-count-theme="b" data-inset="true">';
                for(var i = 0; i < app.visitas.length; i++){
                    visita = app.visitas[i];
                    var loc = new L.LatLng(visita.lat, visita.lng);
                    visiMarker = L.marker(loc, {icon: redIcon});
                    visiMarker.bindPopup('<b>Visita: '+ visita.direccion +'</b><br/><button onClick="app.getVisita('+i+')" >Ir a visita</button>');
                    map.addLayer(visiMarker);
                    var intDistancia = geo.getDistance(geo.position, visita);
                    var strDistancia = (""+intDistancia).substring(0,4);
                    visitas_html +='<li><a href="#" onClick="app.verVisita('+i+')">'+visita.direccion+'<span class="ui-li-count">'+ strDistancia +' km</span></a></li>';
                }
                $("#list_visitas").html(visitas_html+'</ul>').trigger('create');
                if(app.toShow || oldVisitas.length < app.visitas.length){
                    app.goTo("visitas");
                    if(oldVisitas.length < app.visitas.length){
                        app.clearMap();
                        app.updateMarker();
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
        $("#item_visita").html('<ul data-role="listview" data-inset="true"><li class="ui-field-contain"><label for="direccion">Direccion:</label><input name="direccion" id="direccion" value="'+ visita.direccion +'" data-clear-btn="true" type="text"></li><li class="ui-field-contain"><label for="nombre">Cliente:</label><input name="nombre" id="nombre" value="'+ visita.nombre_cliente +'" data-clear-btn="true" type="text"></li><li class="ui-field-contain"><label for="telefono">Telefono:</label><a name="telefono" id="telefono" href="tel:'+ visita.telefono_cliente +'" data-clear-btn="true" type="text">'+ visita.telefono_cliente +'</a></li><li class="ui-field-contain"><label for="textarea2">Observaciones:</label><textarea cols="40" rows="8" name="textarea2" id="textarea2">'+visita.observaciones+'</textarea></li><li class="ui-field-contain"><a target="_blank" name="ir" id="ir" href="#" onClick="app.verEncuesta('+idxVisita+');" data-clear-btn="true" >Competar Encuesta</a></li><li class="ui-field-contain"><a target="_blank" name="ir" id="ir" href="#" onClick="app.verVisitaMapa('+idxVisita+');" data-clear-btn="true" >Ver visita en el mapa</a></li></ul>').trigger("create");
    },
    verEncuesta: function(idxVisita){
        visita = app.visitas[idxVisita];
        $("#c2").val(visita.nombre_cliente);
        $("#encuesta_id_visita").val(visita.id_visita);
        app.goTo("encuesta");
    },
    enviarEncuesta: function(){
        var objData = {
            accion:"cargarEncuesta",
            nombre_cliente: $("#c2").val(),
            id_tecnico: app.idTecnico,
            hora_inicio: $("#c4_lstHour").val(),
            minu_inicio: $("#c4_lstMinute").val(),
            hora_final: $("#c5_lstHour").val(),
            minu_final: $("#c5_lstMinute").val(),
            remito_coincide: $("#c6").val(),
            derivado_realizado: $("#c7").val(),
            repactar_visita: $("#c8").val(),
            trabajo1: $("#chkSelect0c9n1").val(),
            trabajo2: $("#chkSelect0c9n2").val(),
            trabajo3: $("#chkSelect0c9n3").val(),
            trabajo4: $("#chkSelect0c9n4").val(),
            trabajo5: $("#chkSelect0c9n5").val(),
            trabajo6: $("#chkSelect0c9n6").val(),
            trabajo7: $("#chkSelect0c9n7").val(),
            trabajo8: $("#chkSelect0c9n8").val(),
            trabajo9: $("#chkSelect0c9n9").val(),
            id_visita:$("#encuesta_id_visita").val()
        };
        $.ajax({url: app.server, dataType: 'json', data: objData, success: function(data) {
            if(data.estado=='OK'){
                app.goTo("visita");
            }else{
                alert(data.estado);
            }
        }});
    },
    verVisitaMapa: function(idxVisita){
        app.goTo("mapa");
        app.setView2Visita = true;
        $("#btnVerVisita").show();
        $("#btnVerVisita").unbind( "click" );
        $("#btnVerVisita").click(function(){app.verVisita(idxVisita)});
        visita = app.visitas[idxVisita];
        map.setView([visita.lat, visita.lng], 15);
        var loc = new L.LatLng(visita.estacion.lat, visita.estacion.lng);
        if(!app.subwayMarker){
            app.subwayMarker = L.marker(loc, {icon: subwayIcon});
            map.addLayer(app.subwayMarker);
        }else{
            app.subwayMarker.setLatLng(loc);
        }
 
    }
};



app.goTo("mapa");
