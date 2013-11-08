function runTest(){
        geo.WatchPosition();
        app.idTecnico = 1;
        app.goTo("mapa");
        app.timerId = setInterval(app.updateState,5000);
        app.clearMap();
                app.updateMarker();
                var oldVisitas = []; 
                app.visitas = [{"id_visita":"1", "direccion": "Av. Cordoba 3000", "lat":-34.591671723881845, "lng":-58.43439102172852, "observaciones": "Hay que cambiar un gomin", "telefono_cliente": "+5411-5555-5555", "nombre_cliente": "Juan Clien"},{"id_visita":"2", "direccion": "Luis Maria Campos y maure", "lat":-34.56856352695369, "lng":-58.437438011169434, "observaciones": "dfsdf", "telefono_cliente": "+5411-5555-5555", "nombre_cliente": "Juan Clien"}];
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
}


