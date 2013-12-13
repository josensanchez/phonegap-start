function runTest(){
        //geo.WatchPosition();
        app.idTecnico = 1;
        app.goTo("mapa");
        //app.timerId = setInterval(app.updateState,5000);

                var oldVisitas = []; 
                app.visitas = [{"id_visita":"4", "direccion": "gaona 2334", "lat":-34.60783304208913, "lng":-58.44672918319702, "observaciones": "hay que cambiarle el gomín a la bici", "telefono_cliente": "+5411-5555-5555", "nombre_cliente": "Juan Clien", "estacion":{ "nombre":"","lng":0, "lat":0}},{"id_visita":"6", "direccion": "Sanchez de Bustamante 2334", "lat":-34.58697287092901, "lng":-58.40525150299072, "observaciones": "NO tiene interne en el celu", "telefono_cliente": "134566778889", "nombre_cliente": "pepe", "estacion":{ "nombre":"Agüero","lng":-58.40697884559631, "lat":-34.5916849721517}}];
                var visitas_html = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Buscar Visitas..." data-count-theme="b" data-inset="true">';
                for(var i = 0; i < app.visitas.length; i++){
                    visita = app.visitas[i];
                    var loc = new L.LatLng(visita.lat, visita.lng);
                    visiMarker = L.marker(loc, {icon: redIcon});
                    visiMarker.bindPopup('<b>Visita: '+ visita.direccion +'</b><br/><button onClick="app.verVisita('+i+')" >Ir a visita</button>');
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
}


