Number.prototype.leftZeroPad = function(numZeros) {
    var n = Math.abs(this);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( this < 0 ) {
        zeroString = '-' + zeroString;
    }
    return zeroString+n;
}
var time = {
        now: function(){
            return new Date(new Date().getTime());
        },
        getProgreso: function(timeStamp1){
            return new Date(new Date().getTime() - timeStamp1);
        },
        format:function(date){
            var hours = date.getHours() - 21;
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            return hours.leftZeroPad(2) + ':' + minutes.leftZeroPad(2) + ':' + seconds.leftZeroPad(2);
        },
        toTTS: function(date){
            var hours = date.getHours() - 21;
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var strMensaje = "";
            if(hours) strMensaje += hours + " horas,";
            if(minutes) strMensaje += minutes + " minutos,";
            if(seconds) strMensaje += seconds + " segundos,";
            return strMensaje;
        },
        getTiempoPorKilometro: function(intDistancia,datetime){
            if(intDistancia==0) return new Date(0); 
            var timestamp = datetime.getTime() / intDistancia;
            return new Date(timestamp);
        }
}