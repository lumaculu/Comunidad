var VERSION_APP = 2;
var DB_VERSION = 1;// borrar desde aqui
var DB_NAME = "Basedatos";
DATOS_INICIALES = false;
DATOS_INICIO = false;

var abreBasedatosdeIndexedDB = function(){
 return new Promise(function(resolve, reject){
  if (!window.indexedDB){
   reject("IndexedDB no soportado");
  }
  var request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = function(event){
   reject("Error en Basedatos: " + event.target.error);
  };
  request.onupgradeneeded = function(event){
   var db = event.target.result;
   if (!db.objectStoreNames.contains("Gasto")){
    db.createObjectStore("Gasto", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Mensajes")){
    db.createObjectStore("Mensajes", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Sesiones")){
    db.createObjectStore("Sesiones", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Settings")){
    db.createObjectStore("Settings", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Vecinos")){
    db.createObjectStore("Vecinos", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Vinculos")){
    db.createObjectStore("Vinculos", {autoIncrement: true});
   }
   if (!db.objectStoreNames.contains("Inicio")){
    db.createObjectStore("Inicio", {autoIncrement: true});
   }
  };
  request.onsuccess = function(event){
   resolve(event.target.result);
  };
 });
};

var abreDatosdeIndexedDB = function(db, storeName, transactionMode){
 return db
 .transaction(storeName, transactionMode)
 .objectStore(storeName);
};

var añadeDatosaIndexedDB = function(storeName, object){
 return new Promise(function(resolve, reject){
  abreBasedatosdeIndexedDB().then(function(db) {
   abreDatosdeIndexedDB(db, storeName, "readwrite")
   .add(object).onsuccess = resolve;
   //mostrarDatosdeIndexedDB();
  }).catch(function(errorMessage){
   reject(errorMessage);
  });
 });
};

var modificarTablaenIndexedDB = function(storeName, object){
 return new Promise(function(resolve){
  abreBasedatosdeIndexedDB().then(function(db){
   var objectStore = abreDatosdeIndexedDB(db, storeName, "readwrite");
   objectStore.openCursor().onsuccess = function(event){
    var cursor = event.target.result;
    if (cursor){
      object.forEach(function(child){
       var clave = child.key;
       var valor = child.val();
      if(clave == cursor.value.clave)
       cursor.update({clave, valor});
      })
     cursor.continue();
    }
   };
  }).catch(function(){
    console.log('Fallo yendo a por los '+storeName);
  });
 });
};

var borrarTabladeIndexedDB = function(storeName){
 return new Promise(function(resolve, reject){
  abreBasedatosdeIndexedDB().then(function(db){
   abreDatosdeIndexedDB(db, storeName, "readwrite").clear()
   .onsuccess = function(event){
     console.log("Tabla "+storeName+" modificada");
   }
  })
 })
}

var obtenResultadodeIndexedDB = function(storeName){
 return new Promise(function(resolve){
  abreBasedatosdeIndexedDB().then(function(db){
   var objectStore = abreDatosdeIndexedDB(db, storeName);
   var resultado = [];
   objectStore.openCursor().onsuccess = function(event){
    var cursor = event.target.result;
    if (cursor){
     resultado.push(cursor.value);
     cursor.continue();
    }else{
     if (resultado.length > 0){
      resolve(resultado);
     }else{
      console.log("No hay datos");
      resultado.push(0);
      resolve(resultado);
     }
    }
   };
  }).catch(function(){
    console.log('Fallo yendo a por los '+storeName);
  });
 });
};

var routes = [
  // A partir de aquí lo mío
  // Index page
  {
    path: '/',
    url: './index.html',
    on: {
     pageInit: function (e, page) {
      console.log('Dentro de index.html');
      if(!navigator.onLine){
        obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
         for (var i = 0; i < Object.keys(Inicio).length; i++){
          var todo = Object.values(Inicio[i]).toString();
          console.log('desde IndexedDB: '+todo);
          if(todo.startsWith("ZGastos")){
           var zGastos = todo.substr(8);
           $('#totalGastos').html(zGastos+"€");
          }
          if(todo.startsWith("ZIngresos")){
           var zIngresos = todo.substr(10);
           $('#totalIngresos').html(zIngresos+"€");
          }
          if(todo.startsWith("ZSaldo")){
           var zSaldo = todo.substr(7);
           $('#saldo').html(zSaldo+"€");
          }
         }
        });
      }
       /*if(Framework7.device.webView){
         console.log('No está añadida a la pantalla de inicio');
         $('.page').html('');
         $('.page').addClass('instalar').append('<div id="logo"><h2 id="añadir"><strong>Desarrollo de aplicaciones móviles</strong></h2></div><div id="icono"><h2 id="añadir"><strong>Comunidad</strong><br>Añádela a tu<br><strong>Pantalla de Inicio</strong></h2></div></div>');
       }else{
         console.log('Añadida a pantalla de inicio');*/
       /* Cerrar Pantalla de Login si ya nos conectamos */
       firebase.auth().onAuthStateChanged(function(user) {
        if (user && localStorage.vecino) {
         if (!DATOS_INICIALES){
          datosInicio();
         }else{
          refComunidad.orderByKey().startAt("Z").on("value", function(data){
           var ZIngresos = data.val().ZIngresos;
           var ZGastos = data.val().ZGastos;
           var ZSaldo = data.val().ZSaldo;
           $('#totalIngresos').text(ZIngresos+"€");
           $('#totalGastos').text(ZGastos+"€");
           $('#saldo').text(ZSaldo+"€");
          });
          refSettings.child('Años').on("value", function(data){
           app.Años = data.val().split(',');
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });
          refSettings.child('Saldo').on("value", function(data){
           $('.card-footer.centrado').text('Ingresos - Gastos + Año anterior (' + data.val() + '€)');
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });
         }
         if(localStorage.acceso == 'true'){
          app.acceso = true;
          console.log("Acceso: Administrador");
          $('.quitar').show();
          var documentos = $('.toolbar-inner a').eq(3);
          documentos.attr({
            href: '/subirArchivo/'
          })
          var vecinos = $('.navbar-inner a').eq(0);
          vecinos.attr({
            href: '/settings/'
          })
          // Este segundo es casi igual que el de arriba porque cuando volvemos
          // de borrarIngreso() con app.router.navigate('/'), nos encontramos
          // con 2 navbars, una en page-previous y otra en  page-current. Esta
          // última no tiene href="/settings/" por eso al ser la segunda pongo
          // var vecinos = $('.navbar-inner a').eq(1). Investigar porqué.
          var vecinos = $('.navbar-inner a').eq(1);
          vecinos.attr({
            href: '/settings/'
          })
          /*refComunidad.orderByKey().startAt("Z").on("value", function(data){
           obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
            var ZIngresos = data.val().ZIngresos;
            var ZGastos = data.val().ZGastos;
            var ZSaldo = data.val().ZSaldo;
            $('#totalIngresos').text(ZIngresos+"€");
            $('#totalGastos').text(ZGastos+"€");
            $('#saldo').text(ZSaldo+"€");
            var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
            var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
            if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
             console.log("Los ingresos o gastos han cambiado");
             modificarTablaenIndexedDB("Inicio", data);
            }else{
             console.log("Los ingresos o gastos son los mismos");
            }
           })
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });
          refSettings.on("value", function(data){
           obtenResultadodeIndexedDB('Settings').then(function(Settings){
           $('.card-footer.centrado').text('Ingresos - Gastos + Año anterior (' + data.val().Saldo + '€)');
           app.Años = data.val().Años.split(',');
           var añosIndexedDB = Object.values(Settings[0]).toString().substr(5);
           console.log(añosIndexedDB);
           if(data.val().Años != añosIndexedDB){
            console.log("Los años a mostrar han cambiado");
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("Los años a mostrar son los mismos");
           }
           var gastosIndexedDB = Object.values(Settings[1]).toString().substr(7);
           console.log(gastosIndexedDB);
           if(data.val().Gastos != gastosIndexedDB){
            console.log("Los gastos a mostrar han cambiado");
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("Los gastos a mostrar son los mismos");
           }
           var saldoIndexedDB = Object.values(Settings[2]).toString().substr(6);
           console.log(saldoIndexedDB);
           if(data.val().Saldo != saldoIndexedDB){
            console.log("El saldo del año anterior ha cambiado, era: "+saldoIndexedDB+" ahora es igual a: "+data.val().Saldo);
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("El saldo del año anterior es el mismo");
           }
          })
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });*/
         }else{
          console.log("Acceso: Usuario");
          $('.quitar').hide();
          var documentos = $('.toolbar-inner a').eq(3);
          documentos.attr({
            href: '/subirArchivo2/'
          })
          var vecinos = $('.navbar-inner a').eq(0);
          vecinos.attr({
            href: '/vecinos/'
          })
          /*refComunidad.orderByKey().startAt("Z").on("value", function(data){
           obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
            var ZIngresos = data.val().ZIngresos;
            var ZGastos = data.val().ZGastos;
            var ZSaldo = data.val().ZSaldo;
            $('#totalIngresos').text(ZIngresos+"€");
            $('#totalGastos').text(ZGastos+"€");
            $('#saldo').text(ZSaldo+"€");
            var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
            var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
            if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
             console.log("Los ingresos o gastos han cambiado");
             modificarTablaenIndexedDB("Inicio", data);
            }else{
             console.log("Los ingresos o gastos son los mismos");
            }
           })
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });
          refSettings.on("value", function(data){
           obtenResultadodeIndexedDB('Settings').then(function(Settings){
           $('.card-footer.centrado').text('Ingresos - Gastos + Año anterior (' + data.val().Saldo + '€)');
           app.Años = data.val().Años.split(',');
           var añosIndexedDB = Object.values(Settings[0]).toString().substr(5);
           console.log(añosIndexedDB);
           if(data.val().Años != añosIndexedDB){
            console.log("Los años a mostrar han cambiado");
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("Los años a mostrar son los mismos");
           }
           var gastosIndexedDB = Object.values(Settings[1]).toString().substr(7);
           console.log(gastosIndexedDB);
           if(data.val().Gastos != gastosIndexedDB){
            console.log("Los gastos a mostrar han cambiado");
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("Los gastos a mostrar son los mismos");
           }
           var saldoIndexedDB = Object.values(Settings[2]).toString().substr(6);
           console.log(saldoIndexedDB);
           if(data.val().Saldo != saldoIndexedDB){
            console.log("El saldo del año anterior ha cambiado, era: "+saldoIndexedDB+" ahora es igual a: "+data.val().Saldo);
            modificarTablaenIndexedDB("Settings", data);
           }else{
            console.log("El saldo del año anterior es el mismo");
           }
          })
          }, function (errorObject) {
            console.log("Fallo leyendo: " + errorObject.code);
          });*/
         }
         app.loginScreen.close();
        }

        /*refComunidad.orderByKey().startAt("Z").on("value", function(data){
         obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
          var ZIngresos = data.val().ZIngresos;
          var ZGastos = data.val().ZGastos;
          var ZSaldo = data.val().ZSaldo;
          $('#totalIngresos').text(ZIngresos+"€");
          $('#totalGastos').text(ZGastos+"€");
          $('#saldo').text(ZSaldo+"€");
          var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
          var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
          if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
           console.log("Los ingresos o gastos han cambiado");
           modificarTablaenIndexedDB("Inicio", data);
          }else{
           console.log("Los ingresos o gastos son los mismos");
          }
         })
        }, function (errorObject) {
          console.log("Fallo leyendo (probablemente no estás logeado): " + errorObject.code);
        });
        refSettings.on("value", function(data){
         obtenResultadodeIndexedDB('Settings').then(function(Settings){
         $('.card-footer.centrado').text('Ingresos - Gastos + Año anterior (' + data.val().Saldo + '€)');
         app.Años = data.val().Años.split(',');
         var añosIndexedDB = Object.values(Settings[0]).toString().substr(5);
         console.log(añosIndexedDB);
         if(data.val().Años != añosIndexedDB){
          console.log("Los años a mostrar han cambiado");
          modificarTablaenIndexedDB("Settings", data);
         }else{
          console.log("Los años a mostrar son los mismos");
         }
         var gastosIndexedDB = Object.values(Settings[1]).toString().substr(7);
         console.log(gastosIndexedDB);
         if(data.val().Gastos != gastosIndexedDB){
          console.log("Los gastos a mostrar han cambiado");
          modificarTablaenIndexedDB("Settings", data);
         }else{
          console.log("Los gastos a mostrar son los mismos");
         }
         var saldoIndexedDB = Object.values(Settings[2]).toString().substr(6);
         console.log(saldoIndexedDB);
         if(data.val().Saldo != saldoIndexedDB){
          console.log("El saldo del año anterior ha cambiado, era: "+saldoIndexedDB+" ahora es igual a: "+data.val().Saldo);
          modificarTablaenIndexedDB("Settings", data);
         }else{
          console.log("El saldo del año anterior es el mismo");
         }
        })
        }, function (errorObject) {
          console.log("Fallo leyendo (probablemente no estás logeado): " + errorObject.code);
        });*/

        $('.login-screen .page-content').css('visibility', 'visible');
       });
     }
   }
  },
  // ingresos page
  {
    path: '/ingresos/',
    url: './pages/ingresos.html',
    on: {
     pageInit: function (e, page) {
       if(!navigator.onLine){
        notificationFulldesconectado.open();
        obtenResultadodeIndexedDB('Settings').then(function(Settings){
         for (var i = 0; i < Object.keys(Settings).length; i++){
          var todo = Object.values(Settings[i]).toString();
          console.log('Desde indexedDB: '+todo);
          if(todo.startsWith('Años')){
           var añosIndexedDB = todo.substr(5);
           console.log(añosIndexedDB);
          }
         }
        app.Años = añosIndexedDB.split(',');
        })
        obtenResultadodeIndexedDB('Vecinos').then(function(Vecinos){
        $('#ingresos').html('');
        totalCuotas = 0; momentaneo = []; valorUltimo = 0;
        for (var i = 0; i <= app.Años.length-1; i++) {
          momentaneo[i] = 0;
        }
         for (var i = 0; i < Object.keys(Vecinos).length; i++){
          var todo = Object.values(Vecinos[i]).toString();
          var claveAñoVecino = todo.substr(5, 7);
          var claveVecino = todo.substr(9, 3);
          var claveAño = todo.substr(5, 4);
          var valor = parseInt(todo.substr(todo.lastIndexOf(',')+1), 10);
          switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
          if(todo.startsWith('Total')){
            $('#ingresos').append(
            "<li class=año"+claveAño+">"+
            "<a href='/ingresosDetalle/"+claveAñoVecino+"/' class='item-link item-content link'>"+
            "<div class='item-inner'>"+
            "<div class='item-title'>Total: "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
            "</div>"+
            "<div class='item-after'>"+vecino+"</div>"+
            "</div>"+
            "</a>"+
            "<div class='sortable-handler'></div>"+
            "</li>");
             if(claveAño == app.Años[2]){
              valorUltimo = momentaneo[2];
              momentaneo[2] = valorUltimo+valor;
              console.log(claveAño+app.Años[2]+momentaneo[2]);
             }else if(claveAño == app.Años[1]){
              valorUltimo = momentaneo[1];
              momentaneo[1] = valorUltimo+valor;
              console.log(claveAño+app.Años[1]+momentaneo[1]);
             }else if(claveAño == app.Años[0]){
              valorUltimo = momentaneo[0];
              momentaneo[0] = valorUltimo+valor;
              console.log(claveAño+app.Años[0]+momentaneo[0]);
             }
            totalCuotas += valor;
            console.log(totalCuotas);
          }
          if(claveAño < app.Años[0])
          $('.año'+claveAño+'').hide();
         }
         $("[href='#tab-1']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[0]).show();
           for(i=1; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         $("[href='#tab-2']").on('click', function(){
           console.log(app.Años.length);
           for(i=0; i<app.Años.length; i++){
            $('.año'+app.Años[i]).show();
           }
         })
         $("[href='#tab-3']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[1]).show();
           $('.año'+app.Años[0]).hide();
           for(i=2; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         $('.popover-links').on('popover:opened', function (e, popover) {
          $('#popover-ingresos').html('');
          $('#popover-ingresos').append(
            '<li><a class="list-button item-link" href="#"><b>Ingresos Últimos 3 Años:</b></a></li>'+
            '<li><a class="list-button item-link" href="#">Total Ingresos 2019: '+momentaneo[0]+'€</a></li>'+
            '<li><a class="list-button item-link" href="#">Total Ingresos 2018: '+momentaneo[1]+'€</a></li>'+
            '<li><a class="list-button item-link" href="#">Total Ingresos 2017: '+momentaneo[2]+'€</a></li>');
         });
         if(!totalCuotas){
          $('.list.ingresos').remove();
          $('.page-content.ingresos').append('<div class="block-title">Nada en ingresos</div>');
         }
        });
      }else{
      //app.preloader.show();
      refVecinos.orderByKey().startAt("Total").on("value", function(data){
       $('#ingresos').html('');
       totalCuotas = 0; momentaneo = []; valorUltimo = 0;
       for (var i = 0; i <= app.Años.length-1; i++) {
         momentaneo[i] = 0;
       }
       console.log(momentaneo);
       data.forEach(function(child){
        var clave = child.key;
        var valor = child.val();
        var claveAño = clave.substr(5, 4);
        var claveVecino = clave.substr(9, 3);
        switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
        if(valor){
         $('#ingresos').append(
         "<li class=año"+claveAño+">"+
         "<a href='/ingresosDetalle/"+clave+"/' class='item-link item-content link'>"+
         "<div class='item-inner'>"+
         "<div class='item-title'>Total: "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
         "</div>"+
         "<div class='item-after'>"+vecino+"</div>"+
         "</div>"+
         "</a>"+
         "<div class='sortable-handler'></div>"+
         "</li>");
         //for (var i = app.Años.length-1; i >= 0; i--) {
         if(claveAño == app.Años[2]){
          valorUltimo = momentaneo[2];
          momentaneo[2] = valorUltimo+valor;
          console.log(claveAño+app.Años[2]+momentaneo[2]);
         }else if(claveAño == app.Años[1]){
          valorUltimo = momentaneo[1];
          momentaneo[1] = valorUltimo+valor;
          console.log(claveAño+app.Años[1]+momentaneo[1]);
         }else if(claveAño == app.Años[0]){
          valorUltimo = momentaneo[0];
          momentaneo[0] = valorUltimo+valor;
          console.log(claveAño+app.Años[0]+momentaneo[0]);
         }
         //}
         totalCuotas += valor;
         console.log(totalCuotas);
        }
         if(claveAño < app.Años[0])
         $('.año'+claveAño+'').hide();
         $("[href='#tab-1']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[0]).show();
           for(i=1; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         $("[href='#tab-2']").on('click', function(){
           console.log(app.Años.length);
           for(i=0; i<app.Años.length; i++){
            $('.año'+app.Años[i]).show();
           }
         })
         $("[href='#tab-3']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[1]).show();
           $('.año'+app.Años[0]).hide();
           for(i=2; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         //$('.año2017').hide();
       });
       $('.popover-links').on('popover:opened', function (e, popover) {
        $('#popover-ingresos').html('');
        $('#popover-ingresos').append(
          '<li><a class="list-button item-link" href="#"><b>Ingresos Últimos 3 Años:</b></a></li>'+
          '<li><a class="list-button item-link" href="#">Total Ingresos 2019: '+momentaneo[0]+'€</a></li>'+
          '<li><a class="list-button item-link" href="#">Total Ingresos 2018: '+momentaneo[1]+'€</a></li>'+
          '<li><a class="list-button item-link" href="#">Total Ingresos 2017: '+momentaneo[2]+'€</a></li>');
       });
       if(!totalCuotas){
        $('.list.ingresos').remove();
    	  $('.page-content.ingresos').append('<div class="block-title">Nada en ingresos</div>');
       }
       //app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
      }// fin del else
     },
    }
  },
  // ingresosDetalle page
  {
  path: '/ingresosDetalle/:index/',
  url: './pages/ingresosDetalle.html',
  on: {
   pageInit: function (e, page) {
     if(!navigator.onLine){
      obtenResultadodeIndexedDB('Vecinos').then(function(Vecinos){
       $('#ingresosDetalle').html('');
       for (var i = 0; i < Object.keys(Vecinos).length; i++){
         var todo = Object.values(Vecinos[i]).toString();
         console.log(todo);
         var claveAñoVecino = page.route.params.index;
         console.log(claveAñoVecino);
         if(todo.startsWith(claveAñoVecino)){
          var claveAño = todo.substr(0, 4);
          var claveMes = todo.substr(7, 2);
          var claveMesNumeros = todo.substr(7, 2);
          switch (claveMes){case "01": claveMes="Ene";	break; case "02": claveMes="Feb"; break; case "03": claveMes="Mar";	break; case "04": claveMes="Abr"; break; case "05": claveMes="May";	break; case "06": claveMes="Jun"; break; case "07": claveMes="Jul";	break; case "08": claveMes="Ago"; break; case "09": claveMes="Sep";	break; case "10": claveMes="Oct"; break; case "11": claveMes="Nov";	break; case "12": claveMes="Dic"; break;}
          var valor = todo.substr(todo.lastIndexOf(',')+1);
          if(app.acceso){
           $('#ingresosDetalle').append(
           "<li>"+
           "<a href='/actualizarIngreso/"+claveAñoVecino+claveMesNumeros+valor+"/' class='item-link item-content link'>"+
           "<div class='item-inner'>"+
           "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
           "</div>"+
           "</div>"+
           "</a>"+
           "</li>");
          }else{
           $('#ingresosDetalle').append(
           "<li>"+
           "<div class='item-inner item-content'>"+
         	 "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
           "</div>"+
           "</div>"+
           "</a>"+
           "</li>");
          }
         }
        }
      });
    }

    //app.preloader.show();
    var id = page.route.params.index;
    var claveAñoVecino = id.substr(5);
    var claveAño = id.substr(5, 4);
     refVecinos.orderByKey().startAt(claveAñoVecino+"01").endAt(claveAñoVecino+"12").on("value", function(data){
     $('#ingresosDetalle').html('');
     data.forEach(function(child){
      var claveCompleta = child.key;
      var claveMes = claveCompleta.substr(7, 2);
      switch (claveMes){case "01": claveMes="Ene";	break; case "02": claveMes="Feb"; break; case "03": claveMes="Mar";	break; case "04": claveMes="Abr"; break; case "05": claveMes="May";	break; case "06": claveMes="Jun"; break; case "07": claveMes="Jul";	break; case "08": claveMes="Ago"; break; case "09": claveMes="Sep";	break; case "10": claveMes="Oct"; break; case "11": claveMes="Nov";	break; case "12": claveMes="Dic"; break;}
      var valor = child.val();
      if(app.acceso){
       $('#ingresosDetalle').append(
       "<li>"+
       "<a href='/actualizarIngreso/"+claveCompleta+valor+"/' class='item-link item-content link'>"+
       "<div class='item-inner'>"+
       "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
       "</div>"+
       "</div>"+
       "</a>"+
       "</li>");
      }else{
       $('#ingresosDetalle').append(
       "<li>"+
       "<div class='item-inner item-content'>"+
    	 "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
       "</div>"+
       "</div>"+
       "</a>"+
       "</li>");
      }
     });
     //app.preloader.hide();
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });
   },
  }
  },
  // actualizarIngreso page
  {
  path: '/actualizarIngreso/:index/',
  url: './pages/actualizarIngreso.html',
  on: {
   pageInit: function (e, page) {
    var id = page.route.params.index;
    var valorVecino = id.substr(4, 3);
    $('#vecino').val(valorVecino);
    var valorAño = id.substr(0, 4);
    $('#año').val(valorAño);
    var valorMes = id.substr(7, 2);
    switch (valorMes){case "01": valorMes="Ene";	break; case "02": valorMes="Feb"; break; case "03": valorMes="Mar";	break; case "04": valorMes="Abr"; break; case "05": valorMes="May";	break; case "06": valorMes="Jun"; break; case "07": valorMes="Jul";	break; case "08": valorMes="Ago"; break; case "09": valorMes="Sep";	break; case "10": valorMes="Oct"; break; case "11": valorMes="Nov";	break; case "12": valorMes="Dic"; break;}
    $('#mes').val(valorMes);
    var cantidad = id.substr(9);
    $('#cantidad').val(cantidad);
    $('.actualizarIngreso').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     actIngreso(cantidad);
    });
    $('.borrarIngreso').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     borrarIngreso(cantidad);
     //app.router.navigate('/');
    });
   },
  }
  },
  //insertarIngreso page
  {
  path: '/insertarIngreso/',
  url: './pages/insertarIngreso.html',
  on: {
   pageInit: function (e, page) {
         self.pickerDevice = app.picker.create({
           inputEl: '#vecino',
           cols: [
             {
               textAlign: 'center',
               values: ['001','002','003','004','011','012','013','014','021','022','023','024'],
               displayValues: ['Bajo Puerta 1', 'Bajo Puerta 2', 'Bajo Puerta 3', 'Bajo Puerta 4', 'Primero Puerta 1', 'Primero Puerta 2', 'Primero Puerta 3', 'Primero Puerta 4', 'Segundo Puerta 1', 'Segundo Puerta 2', 'Segundo Puerta 3', 'Segundo Puerta 4']
             }
           ]
         });
         self.pickerDevice = app.picker.create({
           inputEl: '#año',
           cols: [
             {
               textAlign: 'center',
               values: app.Años
             }
           ]
         });
         self.pickerDevice = app.picker.create({
           inputEl: '#mes',
           cols: [
             {
               textAlign: 'center',
               values: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
             }
           ]
         });
    $('.insertarIngreso').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     insIngreso();
    });
   },
  }
  },
  // gastos page
  {
    path: '/gastos/',
    url: './pages/gastos.html',
    on: {
     pageInit: function (e, page) {
       if(!navigator.onLine){
         notificationFulldesconectado.open();
         obtenResultadodeIndexedDB('Settings').then(function(Settings){
          for (var i = 0; i < Object.keys(Settings).length; i++){
           var todo = Object.values(Settings[i]).toString();
           console.log('Desde indexedDB: '+todo);
           if(todo.startsWith('Años')){
            var añosIndexedDB = todo.substr(5);
            console.log(añosIndexedDB);
           }
          }
         app.Años = añosIndexedDB.split(',');
         })
        obtenResultadodeIndexedDB('Gasto').then(function(Gastos){
        $('#gastos').html('');
        totalGastos = 0; momentaneo = []; valorUltimo = 0;
        for (var i = 0; i <= app.Años.length-1; i++) {
          momentaneo[i] = 0;
        }
         for (var i = 0; i < Object.keys(Gastos).length; i++){
          var todo = Object.values(Gastos[i]).toString();
          var claveAño = todo.substr(5, 4);
          var claveGasto = todo.slice(9, todo.lastIndexOf(','));
          var valor = parseInt(todo.substr(todo.lastIndexOf(',')+1), 10);
          if(todo.startsWith('Total')){
            $('#gastos').append(
            "<li class=año"+todo.substr(5, 4)+">"+
            "<a href='/gastosDetalle/"+claveAño+claveGasto+"/' class='item-link item-content link'>"+
            "<div class='item-inner'>"+
            "<div class='item-title'>Total: "+todo.substr(todo.lastIndexOf(',')+1)+"€"+"<div class='item-footer'>"+todo.substr(5, 4)+"</div>"+
            "</div>"+
            "<div class='item-after'>"+todo.slice(9, todo.lastIndexOf(','))+"</div>"+
            "</div>"+
            "</a>"+
            "<div class='sortable-handler'></div>"+
            "</li>");

             if(claveAño == app.Años[0]){
              valorUltimo = momentaneo[0];
              momentaneo[0] = valorUltimo+valor;
              console.log(claveAño+app.Años[0]+momentaneo[0]);
            }else if(claveAño == app.Años[1]){
              valorUltimo = momentaneo[1];
              momentaneo[1] = valorUltimo+valor;
              console.log(claveAño+app.Años[1]+momentaneo[1]);
            }else if(claveAño == app.Años[2]){
              valorUltimo = momentaneo[2];
              momentaneo[2] = valorUltimo+valor;
              console.log(claveAño+app.Años[2]+momentaneo[2]);
             }
             totalGastos += valor;
             console.log(totalGastos);
          }
          if(claveAño < app.Años[0])
          $('.año'+claveAño+'').hide();
          $("[href='#tab-1']").on('click', function(){
            console.log(app.Años.length);
            $('.año'+app.Años[0]).show();
            for(i=1; i<app.Años.length; i++){
             $('.año'+app.Años[i]).hide();
            }
          })
          $("[href='#tab-2']").on('click', function(){
            console.log(app.Años.length);
            for(i=0; i<app.Años.length; i++){
             $('.año'+app.Años[i]).show();
            }
          })
          $("[href='#tab-3']").on('click', function(){
            console.log(app.Años.length);
            $('.año'+app.Años[1]).show();
            $('.año'+app.Años[0]).hide();
            for(i=2; i<app.Años.length; i++){
             $('.año'+app.Años[i]).hide();
            }
          })

          if(todo.substr(5, 4) < app.Años[0])
          $('.año'+todo.substr(5, 4)+'').hide();
         }
        });
        $('.popover-links').on('popover:opened', function (e, popover) {
         $('#popover-gastos').html('');
         $('#popover-gastos').append(
           '<li><a class="list-button item-link" href="#"><b>Gastos Últimos 3 Años:</b></a></li>'+
           '<li><a class="list-button item-link" href="#">Total Gastos 2019: '+momentaneo[0]+'€</a></li>'+
           '<li><a class="list-button item-link" href="#">Total Gastos 2018: '+momentaneo[1]+'€</a></li>'+
           '<li><a class="list-button item-link" href="#">Total Gastos 2017: '+momentaneo[2]+'€</a></li>');
        });
        if(!totalGastos){
         $('.list.gastos').remove();
       	$('.page-content.gastos').append('<div class="block-title">Nada en gastos</div>');
        }
      }else{
      //app.preloader.show();
      refGasto.orderByKey().startAt("Total").on("value", function(data){
       $('#gastos').html('');
       totalGastos = 0; momentaneo = []; valorUltimo = 0;
       for (var i = 0; i <= app.Años.length-1; i++) {
         momentaneo[i] = 0;
       }
       console.log(momentaneo);
       data.forEach(function(child){
        var clave = child.key;
        var valor = child.val();
        var claveAño = clave.substr(5, 4);
        var claveGasto = clave.substr(9);
         if(valor){
         $('#gastos').append(
         "<li class=año"+claveAño+">"+
         "<a href='/gastosDetalle/"+clave+"/' class='item-link item-content link'>"+
         "<div class='item-inner'>"+
         "<div class='item-title'>Total: "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
         "</div>"+
         "<div class='item-after'>"+claveGasto+"</div>"+
         "</div>"+
         "</a>"+
         "<div class='sortable-handler'></div>"+
         "</li>");
         for (var i = app.Años.length-1; i >= 0; i--) {
          if(claveAño == app.Años[i]){
           valorUltimo = momentaneo[i];
           momentaneo[i] = valorUltimo+valor;
           console.log(claveAño+app.Años[i]+momentaneo[i]);
          }else if(claveAño == app.Años[i]){
           valorUltimo = momentaneo[i];
           momentaneo[i] = valorUltimo+valor;
           console.log(claveAño+app.Años[i]+momentaneo[i]);
          }else if(claveAño == app.Años[i]){
           valorUltimo = momentaneo[i];
           momentaneo[i] = valorUltimo+valor;
           console.log(claveAño+app.Años[i]+momentaneo[i]);
          }
         }
         totalGastos += valor;
         }
         if(claveAño < app.Años[0])
         $('.año'+claveAño+'').hide();
         $("[href='#tab-1']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[0]).show();
           for(i=1; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         $("[href='#tab-2']").on('click', function(){
           console.log(app.Años.length);
           for(i=0; i<app.Años.length; i++){
            $('.año'+app.Años[i]).show();
           }
         })
         $("[href='#tab-3']").on('click', function(){
           console.log(app.Años.length);
           $('.año'+app.Años[1]).show();
           $('.año'+app.Años[0]).hide();
           for(i=2; i<app.Años.length; i++){
            $('.año'+app.Años[i]).hide();
           }
         })
         //$('.año2017').hide();
       });
       $('.popover-links').on('popover:opened', function (e, popover) {
        $('#popover-gastos').html('');
        $('#popover-gastos').append(
          '<li><a class="list-button item-link" href="#"><b>Gastos Últimos 3 Años:</b></a></li>'+
          '<li><a class="list-button item-link" href="#">Total Gastos 2019: '+momentaneo[0]+'€</a></li>'+
          '<li><a class="list-button item-link" href="#">Total Gastos 2018: '+momentaneo[1]+'€</a></li>'+
          '<li><a class="list-button item-link" href="#">Total Gastos 2017: '+momentaneo[2]+'€</a></li>');
       });
       if(!totalGastos){
        $('.list.gastos').remove();
      	$('.page-content.gastos').append('<div class="block-title">Nada en gastos</div>');
       }
       //app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });

    }//fin else if(navigator.onLine)

     },
    }
  },
  // gastosDetalle page
  {
  path: '/gastosDetalle/:index/',
  url: './pages/gastosDetalle.html',
  on: {
   pageInit: function (e, page) {
     if(!navigator.onLine){
      obtenResultadodeIndexedDB('Gasto').then(function(Gasto){
       $('#gastosDetalle').html('');
       for (var i = 0; i < Object.keys(Gasto).length; i++){
         var todo = Object.values(Gasto[i]).toString();
         var AñoGasto = page.route.params.index;
         if(todo.startsWith(AñoGasto)){
          var claveAño = todo.substr(0, 4);
          var claveMes = todo.substr(todo.lastIndexOf(',')-2, 2);
          console.log("La clave del mes es: "+claveMes);
          var claveMesNumeros = todo.substr(todo.lastIndexOf(',')-2, 2);
          switch (claveMes){case "01": claveMes="Ene";	break; case "02": claveMes="Feb"; break; case "03": claveMes="Mar";	break; case "04": claveMes="Abr"; break; case "05": claveMes="May";	break; case "06": claveMes="Jun"; break; case "07": claveMes="Jul";	break; case "08": claveMes="Ago"; break; case "09": claveMes="Sep";	break; case "10": claveMes="Oct"; break; case "11": claveMes="Nov";	break; case "12": claveMes="Dic"; break;}
          var valor = todo.substr(todo.lastIndexOf(',')+1);
          if(app.acceso){
           $('#gastosDetalle').append(
           "<li>"+
           "<a href='/actualizarGasto/"+AñoGasto+claveMes+":"+valor+"/' class='item-link item-content link'>"+
           "<div class='item-inner'>"+
           "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
           "</div>"+
           "</div>"+
           "</a>"+
           "</li>");
          }else{
           $('#gastosDetalle').append(
           "<li>"+
           "<div class='item-inner item-content'>"+
           "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
           "</div>"+
           "</div>"+
           "</a>"+
           "</li>");
          }
         }
        }
      });
    }

    var id = page.route.params.index;
    var AñoGasto = id.substr(5);
    console.log("AñoGasto: "+ AñoGasto);
    console.log("GASTOS me envía: "+ id);
    var claveAño = id.substr(5, 4);
    //app.preloader.show();
    refGasto.orderByKey().startAt(AñoGasto+"01").endAt(AñoGasto+"12").on("value", function(data){
     $('#gastosDetalle').html('');
     data.forEach(function(child){
      var clave = child.key;
    	console.log(clave);
      var claveAño = clave.substr(0, 4);
      var claveMes = clave.substr(-2);
      switch (claveMes){case "01": claveMes="Ene"; break; case "02": claveMes="Feb"; break; case "03": claveMes="Mar"; break; case "04": claveMes="Abr"; break; case "05": claveMes="May"; break; case "06": claveMes="Jun"; break; case "07": claveMes="Jul"; break; case "08": claveMes="Ago"; break; case "09": claveMes="Sep"; break; case "10": claveMes="Oct"; break; case "11": claveMes="Nov"; break; case "12": claveMes="Dic"; break;}
      var valor = child.val();
      if(app.acceso){
       $('#gastosDetalle').append(
       "<li>"+
       "<a href='/actualizarGasto/"+AñoGasto+claveMes+":"+valor+"/' class='item-link item-content link'>"+
       "<div class='item-inner'>"+
       "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
       "</div>"+
       "</div>"+
       "</a>"+
       "</li>");
      }else{
       $('#gastosDetalle').append(
       "<li>"+
       "<div class='item-inner item-content'>"+
       "<div class='item-title'>"+claveMes+": "+valor+"€"+"<div class='item-footer'>"+claveAño+"</div>"+
       "</div>"+
       "</div>"+
       "</a>"+
       "</li>");
      }
     });
     //app.preloader.hide();
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });

   },
  }
  },
  // actualizarGasto page
  {
  path: '/actualizarGasto/:index/',
  url: './pages/actualizarGasto.html',
  on: {
   pageInit: function (e, page) {
    var id = page.route.params.index;
    console.log(id);
    var valorAño = id.substr(0, 4);
    $('#año').val(valorAño);
    var valorMes = id.substr(id.lastIndexOf(":")-3, 3);
    switch (valorMes){case "01": valorMes="Ene";	break; case "02": valorMes="Feb"; break; case "03": valorMes="Mar";	break; case "04": valorMes="Abr"; break; case "05": valorMes="May";	break; case "06": valorMes="Jun"; break; case "07": valorMes="Jul";	break; case "08": valorMes="Ago"; break; case "09": valorMes="Sep";	break; case "10": valorMes="Oct"; break; case "11": valorMes="Nov";	break; case "12": valorMes="Dic"; break;}
    $('#mes').val(valorMes);
    var cantidad = id.substr(id.lastIndexOf(":")+1);
    $('#cantidad').val(cantidad);
    var valorGasto = id.substring(4, id.indexOf(":")-3);
    $('#gasto').val(valorGasto);
    $('.actualizarGasto').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     actGasto(cantidad);
    });
    $('.borrarGasto').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     borrarGasto(cantidad);
     app.router.navigate('/');
    });
   },
  }
  },
  // insertarGasto page
  {
  path: '/insertarGasto/',
  url: './pages/insertarGasto.html',
  on: {
   pageInit: function (e, page) {
     //app.preloader.show();
     refSettings.child('Gastos').on("value", function(data){
         valor = data.val().split(',');
         console.log(valor);
         self.pickerDevice = app.picker.create({
           inputEl: '#gasto',
           cols: [
             {
               textAlign: 'center',
               values: valor
             }
           ]
         });
         self.pickerDevice = app.picker.create({
           inputEl: '#año',
           cols: [
             {
               textAlign: 'center',
               values: app.Años
             }
           ]
         });
         self.pickerDevice = app.picker.create({
           inputEl: '#mes',
           cols: [
             {
               textAlign: 'center',
               values: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
             }
           ]
         });
     })
     //app.preloader.hide();
    $('.insertarGasto').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     insGasto();
    });
   },
   /*pageBeforeRemove() {
    var self = this;
    self.pickerDevice.destroy();
  },*/
  }
  },
  // settings page
  {
  path: '/settings/',
  url: './pages/settings.html',
  on: {
    pageInit: function (e, page) {
      if(!navigator.onLine){
       notificationFulldesconectado.open();
       obtenResultadodeIndexedDB('Settings').then(function(Gastos){
         for(var i = 0; i < Object.keys(Gastos).length; i++){
           var todo = Object.values(Gastos[i]).toString();
           if(todo.startsWith("Gastos")){
             var valor = todo.substr(todo.indexOf(',')+1);
             var gastos = valor.split(',');
             $('.gastos').text(gastos);
           }
           if(todo.startsWith("Saldo")){
             var valor = todo.substr(todo.indexOf(',')+1);
             var saldo = valor.split(',');
             $('.saldo').text(saldo);
             var saldoAnterior = $('.saldoAnterior a');
             console.log(saldoAnterior);
             saldoAnterior.attr({
              href: '/saldoAnterior/'+saldo+'/'
             })
           }
           if(todo.startsWith("Años")){
             var valor = todo.substr(todo.indexOf(',')+1);
             var años = valor.split(',');
             $('.años').text(años);
             var verAños = $('.verAños a');
             console.log(verAños);
             verAños.attr({
              href: '/verAños/'+años+'/'
             })
           }
         }
       })
      }else{
      refSettings.child('Gastos').on("value", function(data){
        console.log(data.val());
        if(data.val() == null){
          var gastos = data.val();
        }else{
          var gastos = data.val().split(',');
        }
          console.log(gastos);
          $('.gastos').text(gastos);
      })
      refSettings.child('Saldo').on("value", function(data){
          saldo = data.val();
          console.log(saldo);
          $('.saldo').text(saldo);
          var saldoAnterior = $('.saldoAnterior a');
          console.log(saldoAnterior);
          saldoAnterior.attr({
           href: '/saldoAnterior/'+saldo+'/'
          })
      })
      refSettings.child('Años').on("value", function(data){
          años = data.val().split(',');
          console.log(años);
          $('.años').text(años);
          var verAños = $('.verAños a');
          console.log(verAños);
          verAños.attr({
           href: '/verAños/'+años+'/'
          })
      })
      } // fin else
      if(Framework7.device.desktop || Framework7.device.android){
      refGasto.once("value", function(Gasto){
       var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Gasto));
       var a = document.createElement('a');
       a.href = 'data:' + data;
       a.download = 'data.json';
       a.className = 'button external';
       a.innerHTML = 'descargar Base de Datos';
       $('.descargarBD').append(a);
       console.log(Gasto);
      })
      }else{
       $("#descargarBD").remove();
      }
      $('#importarBD').on('click', function() {
       app.dialog.alert("tito");
        app.request.get('js/data.json', function (gasto) {
          var todo = gasto.split(',');
          for(i=0; i<todo.length; i++){
           console.log(todo[i]);
          }
        });
      });

    }
  }
  },
  // saldoAnterior page
  {
  path: '/saldoAnterior/:index/',
  url: './pages/saldoAnterior.html',
  on: {
    pageInit: function (e, page) {
     var id = page.route.params.index;
     console.log("recibo: "+id);
     $('#saldo').val(id);
     $('.actualizarSaldo').on('click', function() {
      if(!navigator.onLine){
       notificationFullrestringido.open();
       return;
      }
      var saldo = $('#saldo').val();
      if (!saldo) return;
      refSettings.update({
       Saldo: saldo}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      });
     });

     $('.aCeroIngresosGastos').on('click', function() {
     app.dialog.confirm('¿Seguro que quieres poner a cero Ingresos y Gastos?', function () {
      if(!navigator.onLine){
       notificationFullrestringido.open();
       return;
      }
      //app.preloader.show();
      refComunidad.update({
       ZIngresos: 0}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      });
      refComunidad.update({
       ZGastos: 0}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      });
      refComunidad.update({
       ZSaldo: parseInt(saldo, 10)}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      });
      //app.preloader.hide();
      app.dialog.alert('¡A cero se puso Ingresos y Gastos!');
      });
     });
    },
  }
  },
  // verAños page
  {
  path: '/verAños/:index/',
  url: './pages/verAños.html',
  on: {
    pageInit: function (e, page) {
     var id = page.route.params.index;
     console.log("recibo: "+id);
     $('#años').val(id);
     $('.actualizarAños').on('click', function() {
      if(!navigator.onLine){
       notificationFullrestringido.open();
       return;
      }
      var años = $('#años').val();
      if (!años) return;
      //app.preloader.show();
      refSettings.update({
       Años: años}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      //app.preloader.hide();
      });
     });
    },
  }
  },
  // verGastos page
  {
  path: '/verGastos/',
  url: './pages/verGastos.html',
  on: {
    pageInit: function (e, page) {
      if(!navigator.onLine){
       notificationFullSettingsGastos.open();
        $('#verGastos').html('');
        obtenResultadodeIndexedDB('Settings').then(function(Settings){
         for (var i = 0; i < Object.keys(Settings).length; i++){
          var todo = Object.values(Settings[i]).toString();
          console.log('desde IndexedDB: '+todo);
          if(todo.startsWith("Gastos")){
           var valor = todo.substr(todo.indexOf(',')+1);
           var array = valor.split(',');
           console.log(valor+'-'+valor.split(',').length);
           for(i=0; i<valor.split(',').length; i++){
            $('#verGastos').append("<li><div class='item-title'>"+array[i]+"</div></li>");
           }
          }
         }
        });
      }else{
      //app.preloader.show();
      refSettings.child('Gastos').on("value", function(data){
        if(data.val() == null){
          var valor = data.val();
        }else{
          var valor = data.val().split(',');
          $('#verGastos').html('');
          for (i = 0; i < valor.length; i++) {
          $('#verGastos').append(
          "<li id=" + i + " class='swipeout deleted-callback' @swipeout:deleted='onDeleted'>"+
          "<div class='item-title'>"+valor[i]+
          "</div>"+
          "</a>"+
          "<div class='swipeout-actions-right'>"+
          '<a href="#" class="swipeout-delete">Borrar</a>'+
          "</div>"+
          "</li>"
          );
          }
        }
          $('.deleted-callback').on('swipeout:deleted', function () {
           if(!navigator.onLine){
            notificationFullrestringido.open();
            return;
           }
          var indice = $(this).attr("id");
          if(indice > -1)
          valor.splice(indice, 1);
          //delete valor[indice];
          console.log(valor.length);
          console.log(valor.toString());
          if(valor.length == 0){
           refSettings.child('Gastos').remove();
           console.log('nada ya');
          }else{
            refSettings.update({
             Gastos: valor.toString()}, function(error){
             if(error){
              console.log("Error Insertando/Actualizando");
             }else{
              console.log("Insertado/Actualizado correctamente");
             }
           });
          }
        })
      })
    }//fin del else
      $('.actualizarGasto').on('click', function() {
       if(!navigator.onLine){
        notificationFullrestringido.open();
        return;
       }
       console.log('Has clicado en Añadir Gasto');
       var gasto = $('#verGasto').val();
       if (gasto.length === 0) return;
       $('#gasto').val('');
       refSettings.child('Gastos').once("value", function(data){
         if(data.val() == null){
           var valor = data.val();
           console.log(valor);
           $('#verGasto').val('');
           refSettings.update({
            Gastos: gasto}, function(error){
            if(error){
             console.log("Error Insertando/Actualizando");
            }else{
             console.log("Insertado/Actualizado correctamente");
            }
           });
         }else{
           valor = data.val().split(',');
           console.log(valor);
           $('#verGasto').val('');
           var gastoSettings = refSettings.child("Gastos");
           gastoSettings.transaction(function(loquehay) {
             return loquehay + ','+ gasto;
           });
         }
       })
      });
      //app.preloader.hide();
    },
  }
  },
  // vecinos page
  {
  path: '/vecinos/',
  url: './pages/vecinos.html',
  on: {
   pageInit: function (e, page) {
    if(!navigator.onLine){
     notificationFulldesconectado.open();
      obtenResultadodeIndexedDB('Vecinos').then(function(Vecinos){
        for(var i = 0; i < Object.keys(Vecinos).length; i++){
          var todo = Object.values(Vecinos[i]).toString();
          if(todo.startsWith("0") || todo.startsWith("1")){
            var valor = todo.substr(todo.indexOf(',')+1);
            var claveVecino = todo.substr(0, 3);
            console.log(vecino+': '+valor);
         if(!app.acceso){
            var vecino = localStorage.getItem("vecino");
            if(todo.startsWith(localStorage.getItem("vecino")+"Pass")){
            switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
            $('#vecinos').append(
            "<li>"+
            "<a href='/actualizarVecino/"+claveVecino+valor+"/' class='item-link item-content link'>"+
            "<div class='item-inner'>"+
            "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+claveVecino+"</div>"+
            "</div>"+
            "<div class='item-after'>"+vecino+"</div>"+
            "</div>"+
            "</a>"+
            "</li>");
            }
          }else{
            switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
            if(todo.startsWith("001Pass")){
             $('#vecinos').append(
             "<li>"+
             "<a href='/actualizarVecino/"+claveVecino+valor+"/' class='item-link item-content link'>"+
             "<div class='item-inner'>"+
             "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+claveVecino+"</div>"+
             "</div>"+
             "<div class='item-after'>"+vecino+"</div>"+
             "</div>"+
             "</a>"+
             "</li>");
             //clave != claveVecino+"Acc"
            }else if(valor != 0 && claveVecino != "001"){
             $('#vecinos').append(
             "<li class='item-content'>"+
             "<div class='item-inner'>"+
             "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+claveVecino+"</div>"+
             "</div>"+
             "<div class='item-after'>"+vecino+"</div>"+
             "</div>"+
             "</li>");
            }
          }
         }
        }
      });
    }else{
    if(!app.acceso){
      console.log(localStorage.getItem("vecino"));
      var vecino = localStorage.getItem("vecino");
      var acceso = localStorage.getItem("acceso");
      //app.preloader.show();
      refVecinos.orderByKey().startAt(vecino+"Pass").endAt(vecino+"Pass").on("value", function(data){
       $('#vecinos').html('');
       data.forEach(function(child){
        var clave = child.key;
        var valor = child.val();
        var claveVecino = clave.substr(0, 3);
        switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
        if(clave != claveVecino+"Acc"){
         $('#vecinos').append(
          "<li class='item-divider'>Actualización de la App</li>"+
          "<li>"+
          "<a href='/actualizarApp/' class='item-link item-content'>"+
          "<div class='item-media'><i class='icon f7-icons'>cloud_download</i></div>"+
          "<div class='item-inner'>"+
          "<div class='item-title'>Actualizar<div class='item-footer'></div></div>"+
          "</div>"+
          "</a>"+
          "</li>"+
          "<li class='item-divider'>Actualizar Password</li>"+
          "<li>"+
          "<a href='/actualizarVecino/"+claveVecino+valor+"/' class='item-link item-content link'>"+
          "<div class='item-inner'>"+
          "<div class='item-title'>Password: "+valor+"<div class='item-footer'></div>"+
          "</div>"+
          "<div class='item-after'>"+vecino+"</div>"+
          "</div>"+
          "</a>"+
          "</li>");
         }
       });
       //app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
    }else{
    //app.preloader.show();
    var acceso = localStorage.getItem("acceso");
    refVecinos.orderByKey().startAt("001Acc").endAt("114Pass").on("value", function(data){
     $('#vecinos').html('');
     data.forEach(function(child){
      var clave = child.key;
      var valor = child.val();
      var claveVecino = clave.substr(0, 3);
      var claveAcceso = clave.substr(3, 3);
      if(claveAcceso.startsWith("Acc")){
       valorAcceso = valor;
       if(valorAcceso){
        derechos = "Administrador";
        elCheckbox = '<input type="checkbox" onChange="actAcceso(\''+claveVecino+'\', 0)" checked id="acceso'+claveVecino+'">';
       }else{
        derechos = "Usuario";
        elCheckbox = '<input type="checkbox" onChange="actAcceso(\''+claveVecino+'\', 1)" id="acceso'+claveVecino+'">';
       }
       console.log(claveAcceso+'-'+valor);
      }
      switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
      if(clave == "001Pass"){
       $('#vecinos').append(
       "<li>"+
       "<a href='/actualizarVecino/"+claveVecino+valor+"/' class='item-link item-content link'>"+
       "<div class='item-inner'>"+
       "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+vecino+" - Acceso: "+derechos+"</div>"+
       "</div>"+
       "<div class='item-after'></div>"+
       "</div>"+
       "</a>"+
       "</li>");
      }else if(clave != claveVecino+"Acc"){
       $('#vecinos').append(
       "<li class='item-content'>"+
       "<div class='item-inner'>"+
       "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+vecino+" - Acceso: "+derechos+"</div>"+
       "</div>"+
       "<div class='item-after'>"+
       "<label class='toggle toggle-init'>"+elCheckbox+
       "<span class='toggle-icon'></span>"+
       "</label>"+
       "</div>"+
       "</div>"+
       "</li>");
      }
     });
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });
   }
 } // fin else if navigator onLine
   },
  }
  },
  // actualizarVecino page
  {
  path: '/actualizarVecino/:index/',
  url: './pages/actualizarVecino.html',
  on: {
   pageInit: function (e, page) {
    var id = page.route.params.index;
    console.log("recibo: "+id);
    var vecino = id.substr(0, 3);
    console.log("vecino: "+vecino);
    $('.vecino').val(vecino);
    var password = id.substr(3);
    console.log("password: "+password);
    $('#password').val(password);
    $('.actualizarVecino').on('click', function() {
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     var password = $('#password').val();
     var user = firebase.auth().currentUser;
     if (user) {
      user.updatePassword(password).then(function() {
       actVecino(vecino, password);
       console.log("nueva contraseña: "+password);
      }).catch(function(error) {
       console.log("error metiendo contraseña nueva");
      });
     }else{
      console.log("error");
     };
    });
   },
  }
  },
  // Actualizacion de la app
  {
  path: '/actualizarApp/',
  url: './pages/actualizarApp.html',
  on:{
   pageInit: function (e, page) {
    refActualizarApp.on("value", function(data){
     var valor = data.val();
     if(app.acceso){
      if(valor > VERSION_APP){
       $('#estadoApp').html("<span class='badge color-red'>La aplicación necesita actualizarse</span> <span class='badge color-red'>v-"+VERSION_APP+"</span>");
      }else{
       $('#estadoApp').html("<span class='badge color-green'>La aplicación está actualizada</span> <span class='badge color-green'>v-"+valor+"</span>");
      }
      //$('#titoAct').html('');
      $('#titoAct').html(
      "<div class='block-title'>Actualizar versión de la app</div>"+
      "<div class='list no-hairlines-md'>"+
      "<ul><li class='item-content item-input'>"+
      "<div class='item-inner'>"+
   	   "<div class='item-title item-label'>Versión</div>"+
        "<div class='item-input-wrap'>"+
         "<input type='text' placeholder='Versión ahora: "+VERSION_APP+"' id='version' required data-error-message='Escriba una versión...'>"+
          "<span class='input-clear-button'></span>"+
        "</div>"+
       "</div>"+
      "</li></ul>"+
      "</div><button class='col button color-blue actualizarVecino' onclick='actApp()'>Actualizar</button>");
     }else{
      if(valor > VERSION_APP){
       $('#estadoApp').html("<span class='badge color-red'>La aplicación necesita actualizarse</span> <span class='badge color-red'>v-"+VERSION_APP+"</span>");
      }else{
       $('#estadoApp').html("<span class='badge color-green'>La aplicación está actualizada</span> <span class='badge color-green'>v-"+VERSION_APP+"</span>");
      }
     }
    })
   },
  },
  },
  // verArchivo
  {
  path: '/verArchivo/:index/',
  url: './pages/verArchivo.html',
  on:{
   pageInit: function (e, page) {
   var id = page.route.params.index;
   console.log("El id es: " + id);
   //app.preloader.show();
    refVinculos.orderByKey().startAt(id).endAt(id).on("value", function(data){
    $('#verArchivo').html('');
     data.forEach(function(child){
      var clave = child.key;
      var valor = child.val();
      console.log(clave + ": " + valor);
      $('#verArchivo').append(
        //"<span><img src="+valor+"></span>" Descomentar para ver fotos en ruta verArchivo
        //"<embed src="+valor+" type='application/pdf'></embed>" Descomentar para ver PDFs en ruta verArchivo
      );
     });
     //app.preloader.hide();
    }, function (errorObject) {
      console.log("Fallo leyendo: " + errorObject.code);
    });
   },
  },
  },
  //subirArchivo
  {
  path: '/subirArchivo/',
  url: './pages/subirArchivo.html',
  on:{
   pageInit: function(e, page){
    if(!navigator.onLine){
     notificationFullDocumentos.open();
      obtenResultadodeIndexedDB('Vinculos').then(function(Vinculos){
       for (var i = 0; i < Object.keys(Vinculos).length; i++){
        var todo = Object.values(Vinculos[i]).toString();
        var clave = todo.substr(0, todo.lastIndexOf(','));
        var valor = todo.substr(todo.lastIndexOf(','));
        var nombreArchivo = valor.substr(valor.indexOf("%2F"), valor.indexOf("?"));
        console.log('desde IndexedDB: '+todo);
        if(todo){
         $('ul#vinculos').append(
         "<li>"+
         "<div class='item-inner item-content'>"+
         "<div class='item-title'>"+clave+
         "</div>"+
         "</div>"+
         "</li>");
        }else{
         $('.list.vinculos').remove();
         $('.page-content.vinculos').append('<div class="block-title">Nada en vinculos</div>');
        }
       }
      });
    }else{
    refVinculos.on("value", function(data){
     $('ul#vinculos').html('');
     data.forEach(function(child){
      var clave = child.key;
      var valor = child.val();
      var nombreArchivo = valor.substr(valor.indexOf("%2F"), valor.indexOf("?"));
      if(valor){
       $('ul#vinculos').append(
       "<li class='swipeout' @swipeout:deleted='onDeleted'>"+
       "<div class='item-inner item-content'>"+
       "<div class='item-title'>"+clave+
       "</div>"+
       "</div>"+
       "</a>"+
       "<div class='swipeout-actions-right'>"+
       '<a href="#" class="swipeout-delete" onclick="borrarDocumento(\''+nombreArchivo+'\')">Borrar</a>'+
       "<a href="+valor+" class='item-content link external'><div class='item-title'>Descargar</div></a>"+
       "</div>"+
       "</li>");
      }else{
       $('.list.vinculos').remove();
       $('.page-content.vinculos').append('<div class="block-title">Nada en vinculos</div>');
      }
     });
     //app.preloader.hide();
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });

  }// fin del else

    var storageService = firebase.storage();
    // asociamos el manejador de eventos sobre el INPUT FILE
    document.getElementById('campoarchivo').addEventListener('change', function(evento){
     if(!navigator.onLine){
      notificationFullrestringido.open();
      return;
     }
     evento.preventDefault();
     var archivo  = evento.target.files[0];
     var archivoSinEspacios = archivo.name.replace(/ /g,'');
     console.log(archivoSinEspacios);
     subirArchivo(archivo);
    });
    // función que se encargará de subir el archivo
    function subirArchivo(archivo) {
     var progress = 0;
     var dialog = app.dialog.progress('Subiendo: '+archivo.name, progress);
     // creo una referencia al lugar donde guardaremos el archivo
     var refStorage = storageService.ref('micarpeta').child(archivo.name);
     // Comienzo la tarea de upload
     var uploadTask = refStorage.put(archivo);
     // defino un evento para saber qué pasa con ese upload iniciado
     uploadTask.on('state_changed', function(snapshot){
      progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + Math.floor(progress) + '% done');
      dialog.setProgress(Math.floor(progress));
      dialog.setText(Math.floor(progress)+'%');
     },
     function(error){
      console.log('Error al subir el archivo', error);
     },
     function(){
      dialog.close();
      insVinculo(archivo.name, uploadTask.snapshot.downloadURL);
     });
    }
   }
  }
  },
  //subirArchivo2
  {
  path: '/subirArchivo2/',
  url: './pages/subirArchivo2.html',
  on:{
    pageInit: function(e, page){
      //app.preloader.show();
      if(!navigator.onLine){
       notificationFullDocumentos.open();
        obtenResultadodeIndexedDB('Vinculos').then(function(Vinculos){
         for (var i = 0; i < Object.keys(Vinculos).length; i++){
          var todo = Object.values(Vinculos[i]).toString();
          var clave = todo.substr(0, todo.lastIndexOf(','));
          var valor = todo.substr(todo.lastIndexOf(','));
          var nombreArchivo = valor.substr(valor.indexOf("%2F"), valor.indexOf("?"));
          console.log('desde IndexedDB: '+todo);
          if(todo){
            $('ul#vinculos').append(
             "<li>"+
              "<div class='item-inner item-content'>"+
              "<div class='item-title'>"+clave+
              "</div>"+
              "</div>"+
             "</li>");
          }else{
           $('.list.vinculos').remove();
           $('.page-content.vinculos').append('<div class="block-title">Nada en vinculos</div>');
          }
         }
        });
      }else{
      refVinculos.on("value", function(data){
       $('ul#vinculos').html('');
       data.forEach(function(child){
        var clave = child.key;
        var valor = child.val();
        if(valor){
          $('ul#vinculos').append(
           "<li>"+
            "<div class='item-inner item-content'>"+
            "<div class='item-title'>"+clave+
            "</div>"+
            "<div class='item-after'><a href="+valor+" class='item-content link external'>"+
            "<div class='item-title'><i class='icon f7-icons'>download</i></div></a></div>"+
            "</div>"+
            "</a>"+
           "</li>");
        }else{
         $('.list.vinculos').remove();
         $('.page-content.vinculos').append('<div class="block-title">Nada en vinculos</div>');
        }
       });
       //app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
     }//fin del else
    }
  }
  },
// notificaciones
{
path: '/notificaciones/',
url: './pages/notificaciones.html',
on:{
 pageInit: function (e, page){
  $('.messages').html('');
  var myMessages = app.messages.create({
   el: '.messages'
  });
  var myMessagebar = app.messagebar.create({
   el: '.messagebar'
  });
  if(!navigator.onLine){
   obtenResultadodeIndexedDB('Mensajes').then(function(Mensajes){
    for (var i = 0; i < Object.keys(Mensajes).length; i++){
     var todo = Object.values(Mensajes[i]).toString();
     console.log(todo);
     var ultimaFecha;
     var clave = todo.substr(0, 16);
     var valor = todo.substr(todo.lastIndexOf(',')+1);
     var claveVecino = clave.substr(clave.length - 3);
     var fechaHorasMinutosSegundos = new Date(parseInt(clave.substr(0, 13))).toLocaleString();
     var fecha = fechaHorasMinutosSegundos.substr(0, fechaHorasMinutosSegundos.lastIndexOf(":")-5);
     var horaMinutos = 'Desconectado';
     var horaMinutos = fechaHorasMinutosSegundos.substr(fechaHorasMinutosSegundos.lastIndexOf(':')-5, 5);
     if (claveVecino == localStorage.vecino){
      messageType = 'sent';
      name = claveVecino;
     }else{
      messageType = 'received';
     }
     if(fecha != ultimaFecha){
      $('.messages').append('<div class="messages-title">' + fecha + '</div>')
      ultimaFecha = fecha;
     }
     myMessages.addMessage({
      text: valor,
      type: messageType,
      textHeader: claveVecino,
      textFooter: horaMinutos
     });
    }
   });
 }else{
   refMensajes.on("value", function(data){
    $('.messages').html('');
    var ultimaFecha;
    data.forEach(function(child){
     var clave = child.key;
     var valor = child.val();
     var claveVecino = clave.substr(clave.length - 3);
     var fechaHorasMinutosSegundos = new Date(parseInt(clave.substr(0, 13))).toLocaleString();
     var fecha = fechaHorasMinutosSegundos.substr(0, fechaHorasMinutosSegundos.lastIndexOf(":")-5);
     var horaMinutos = fechaHorasMinutosSegundos.substr(fechaHorasMinutosSegundos.lastIndexOf(':')-5, 5);
     if (claveVecino == localStorage.vecino){
      messageType = 'sent';
      name = claveVecino;
     }else{
      messageType = 'received';
     }
     if(fecha != ultimaFecha){
      $('.messages').append('<div class="messages-title">' + fecha + '</div>')
      ultimaFecha = fecha;
     }
     myMessages.addMessage({
      text: valor,
      type: messageType,
      textHeader: claveVecino,
      textFooter: horaMinutos
     });
    })
   })
  } // fin else if(navigator.onLine)
  $('.messagebar .link').on('click', function(){
   if(!navigator.onLine){
    notificationFullrestringido.open();
    return;
   }
   var messageText = myMessagebar.getValue().replace(/\n/g, '<br>').trim();
   if (messageText.length === 0) return;
   myMessagebar.clear();
   var fecha = new Date();
   var hora = fecha.getHours();
   var minutos = fecha.getMinutes();
   var horaMinutosDevice = hora+":"+minutos;
   myMessages.addMessage({
    text: messageText,
    type: 'sent',
    textHeader: localStorage.vecino,
    textFooter: horaMinutosDevice
   });
   var refAhora = firebase.database().ref("Comunidad/Sesiones");
   var session = "session" + localStorage.vecino;
   refAhora.update({
    [session]: firebase.database.ServerValue.TIMESTAMP
   });
   refAhora.once("value", function(data){
    data.forEach(function(child){
     var clave = child.key;
     var valor = child.val();
     if(clave == "session" + localStorage.vecino){
      var ahora = valor;
      var claveMensaje = ahora+localStorage.vecino;
      refMensajes.update({
       [claveMensaje]: messageText
      }).catch(function(error) {
       console.log("error metiendo mensaje");
      });
     }
    })
   })
  });
 }
}
},
      // y hasta aquí lo mio
  // About page
  {
    path: '/about/',
    url: './pages/about.html',
    name: 'about',
  },
  // Right Panel pages
  {
    path: '/panel-right-1/',
    content: '\
      <div class="page">\
        <div class="navbar">\
          <div class="navbar-inner sliding">\
            <div class="left">\
              <a href="#" class="link back">\
                <i class="icon icon-back"></i>\
                <span class="ios-only">Back</span>\
              </a>\
            </div>\
            <div class="title">Panel Page 1</div>\
          </div>\
        </div>\
        <div class="page-content">\
          <div class="block">\
            <p>This is a right panel page 1</p>\
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo saepe aspernatur inventore dolorum voluptates consequatur tempore ipsum! Quia, incidunt, aliquam sit veritatis nisi aliquid porro similique ipsa mollitia eaque ex!</p>\
          </div>\
        </div>\
      </div>\
    ',
  },
  {
    path: '/panel-right-2/',
    content: '\
      <div class="page">\
        <div class="navbar">\
          <div class="navbar-inner sliding">\
            <div class="left">\
              <a href="#" class="link back">\
                <i class="icon icon-back"></i>\
                <span class="ios-only">Back</span>\
              </a>\
            </div>\
            <div class="title">Panel Page 2</div>\
          </div>\
        </div>\
        <div class="page-content">\
          <div class="block">\
            <p>This is a right panel page 2</p>\
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo saepe aspernatur inventore dolorum voluptates consequatur tempore ipsum! Quia, incidunt, aliquam sit veritatis nisi aliquid porro similique ipsa mollitia eaque ex!</p>\
          </div>\
        </div>\
      </div>\
    ',
  },

  // Components
  {
    path: '/accordion/',
    url: './pages/accordion.html',
  },
  {
    path: '/action-sheet/',
    componentUrl: './pages/action-sheet.html',
  },
  {
    path: '/autocomplete/',
    componentUrl: './pages/autocomplete.html',
  },
  {
    path: '/badge/',
    componentUrl: './pages/badge.html',
  },
  {
    path: '/buttons/',
    url: './pages/buttons.html',
  },
  {
    path: '/calendar/',
    componentUrl: './pages/calendar.html',
  },
  {
    path: '/calendar-page/',
    componentUrl: './pages/calendar-page.html',
  },
  {
    path: '/cards/',
    url: './pages/cards.html',
  },
  {
    path: '/checkbox/',
    url: './pages/checkbox.html',
  },
  {
    path: '/chips/',
    componentUrl: './pages/chips.html',
  },
  {
    path: '/contacts-list/',
    url: './pages/contacts-list.html',
  },
  {
    path: '/content-block/',
    url: './pages/content-block.html',
  },
  {
    path: '/data-table/',
    componentUrl: './pages/data-table.html',
  },
  {
    path: '/dialog/',
    componentUrl: './pages/dialog.html',
  },
  {
    path: '/elevation/',
    url: './pages/elevation.html',
  },
  {
    path: '/fab/',
    url: './pages/fab.html',
  },
  {
    path: '/fab-morph/',
    url: './pages/fab-morph.html',
  },
  {
    path: '/form-storage/',
    url: './pages/form-storage.html',
  },
  {
    path: '/gauge/',
    componentUrl: './pages/gauge.html',
  },
  {
    path: '/grid/',
    url: './pages/grid.html',
  },
  {
    path: '/icons/',
    componentUrl: './pages/icons.html',
  },
  {
    path: '/infinite-scroll/',
    componentUrl: './pages/infinite-scroll.html',
  },
  {
    path: '/inputs/',
    url: './pages/inputs.html',
  },
  {
    path: '/lazy-load/',
    url: './pages/lazy-load.html',
  },
  {
    path: '/list/',
    url: './pages/list.html',
  },
  {
    path: '/list-index/',
    componentUrl: './pages/list-index.html',
  },
  {
    path: '/login-screen/',
    componentUrl: './pages/login-screen.html',
  },
  {
    path: '/login-screen-page/',
    componentUrl: './pages/login-screen-page.html',
  },
  {
    path: '/messages/',
    componentUrl: './pages/messages.html',
  },
  {
    path: '/navbar/',
    url: './pages/navbar.html',
  },
  {
    path: '/navbar-hide-scroll/',
    url: './pages/navbar-hide-scroll.html',
  },
  {
    path: '/notifications/',
    componentUrl: './pages/notifications.html',
  },
  {
    path: '/panel/',
    url: './pages/panel.html',
  },
  {
    path: '/photo-browser/',
    componentUrl: './pages/photo-browser.html',
  },
  {
    path: '/picker/',
    componentUrl: './pages/picker.html',
  },
  {
    path: '/popup/',
    componentUrl: './pages/popup.html',
  },
  {
    path: '/popover/',
    url: './pages/popover.html',
  },
  {
    path: '/preloader/',
    componentUrl: './pages/preloader.html',
  },
  {
    path: '/progressbar/',
    componentUrl: './pages/progressbar.html',
  },
  {
    path: '/pull-to-refresh/',
    componentUrl: './pages/pull-to-refresh.html',
  },
  {
    path: '/radio/',
    url: './pages/radio.html',
  },
  {
    path: '/range/',
    componentUrl: './pages/range.html',
  },
  {
    path: '/searchbar/',
    url: './pages/searchbar.html',
  },
  {
    path: '/searchbar-expandable/',
    url: './pages/searchbar-expandable.html',
  },
  {
    path: '/sheet-modal/',
    componentUrl: './pages/sheet-modal.html',
  },
  {
    path: '/smart-select/',
    url: './pages/smart-select.html',
  },
  {
    path: '/sortable/',
    url: './pages/sortable.html',
  },
  {
    path: '/statusbar/',
    componentUrl: './pages/statusbar.html',
  },
  {
    path: '/stepper/',
    componentUrl: './pages/stepper.html',
  },
  {
    path: '/subnavbar/',
    url: './pages/subnavbar.html',
  },
  {
    path: '/subnavbar-title/',
    url: './pages/subnavbar-title.html',
  },
  {
    path: '/swiper/',
    url: './pages/swiper.html',
    routes: [
      {
        path: 'swiper-horizontal/',
        url: './pages/swiper-horizontal.html',
      },
      {
        path: 'swiper-vertical/',
        url: './pages/swiper-vertical.html',
      },
      {
        path: 'swiper-space-between/',
        url: './pages/swiper-space-between.html',
      },
      {
        path: 'swiper-multiple/',
        url: './pages/swiper-multiple.html',
      },
      {
        path: 'swiper-nested/',
        url: './pages/swiper-nested.html',
      },
      {
        path: 'swiper-loop/',
        url: './pages/swiper-loop.html',
      },
      {
        path: 'swiper-3d-cube/',
        url: './pages/swiper-3d-cube.html',
      },
      {
        path: 'swiper-3d-coverflow/',
        url: './pages/swiper-3d-coverflow.html',
      },
      {
        path: 'swiper-3d-flip/',
        url: './pages/swiper-3d-flip.html',
      },
      {
        path: 'swiper-fade/',
        url: './pages/swiper-fade.html',
      },
      {
        path: 'swiper-scrollbar/',
        url: './pages/swiper-scrollbar.html',
      },
      {
        path: 'swiper-gallery/',
        componentUrl: './pages/swiper-gallery.html',
      },
      {
        path: 'swiper-custom-controls/',
        url: './pages/swiper-custom-controls.html',
      },
      {
        path: 'swiper-parallax/',
        url: './pages/swiper-parallax.html',
      },
      {
        path: 'swiper-lazy/',
        url: './pages/swiper-lazy.html',
      },
      {
        path: 'swiper-pagination-progress/',
        url: './pages/swiper-pagination-progress.html',
      },
      {
        path: 'swiper-pagination-fraction/',
        url: './pages/swiper-pagination-fraction.html',
      },
      {
        path: 'swiper-zoom/',
        url: './pages/swiper-zoom.html',
      },
    ],
  },
  {
    path: '/swipeout/',
    componentUrl: './pages/swipeout.html',
  },
  {
    path: '/tabs/',
    url: './pages/tabs.html',
  },
  {
    path: '/tabs-static/',
    url: './pages/tabs-static.html',
  },
  {
    path: '/tabs-animated/',
    url: './pages/tabs-animated.html',
  },
  {
    path: '/tabs-swipeable/',
    url: './pages/tabs-swipeable.html',
  },
  {
    path: '/tabs-routable/',
    url: './pages/tabs-routable.html',
    tabs: [
      {
        path: '/',
        id: 'tab1',
        content: ' \
        <div class="block"> \
          <p>Tab 1 content</p> \
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam enim quia molestiae facilis laudantium voluptates obcaecati officia cum, sit libero commodi. Ratione illo suscipit temporibus sequi iure ad laboriosam accusamus?</p> \
          <p>Saepe explicabo voluptas ducimus provident, doloremque quo totam molestias! Suscipit blanditiis eaque exercitationem praesentium reprehenderit, fuga accusamus possimus sed, sint facilis ratione quod, qui dignissimos voluptas! Aliquam rerum consequuntur deleniti.</p> \
          <p>Totam reprehenderit amet commodi ipsum nam provident doloremque possimus odio itaque, est animi culpa modi consequatur reiciendis corporis libero laudantium sed eveniet unde delectus a maiores nihil dolores? Natus, perferendis.</p> \
        </div> \
        ',
      },
      {
        path: '/tab2/',
        id: 'tab2',
        content: '\
        <div class="block"> \
          <p>Tab 2 content</p> \
          <p>Suscipit, facere quasi atque totam. Repudiandae facilis at optio atque, rem nam, natus ratione cum enim voluptatem suscipit veniam! Repellat, est debitis. Modi nam mollitia explicabo, unde aliquid impedit! Adipisci!</p> \
          <p>Deserunt adipisci tempora asperiores, quo, nisi ex delectus vitae consectetur iste fugiat iusto dolorem autem. Itaque, ipsa voluptas, a assumenda rem, dolorum porro accusantium, officiis veniam nostrum cum cumque impedit.</p> \
          <p>Laborum illum ipsa voluptatibus possimus nesciunt ex consequatur rem, natus ad praesentium rerum libero consectetur temporibus cupiditate atque aspernatur, eaque provident eligendi quaerat ea soluta doloremque. Iure fugit, minima facere.</p> \
        </div> \
        ',
      },
      {
        path: '/tab3/',
        id: 'tab3',
        content: '\
        <div class="block"> \
          <p>Tab 3 content</p> \
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam enim quia molestiae facilis laudantium voluptates obcaecati officia cum, sit libero commodi. Ratione illo suscipit temporibus sequi iure ad laboriosam accusamus?</p> \
          <p>Deserunt adipisci tempora asperiores, quo, nisi ex delectus vitae consectetur iste fugiat iusto dolorem autem. Itaque, ipsa voluptas, a assumenda rem, dolorum porro accusantium, officiis veniam nostrum cum cumque impedit.</p> \
          <p>Laborum illum ipsa voluptatibus possimus nesciunt ex consequatur rem, natus ad praesentium rerum libero consectetur temporibus cupiditate atque aspernatur, eaque provident eligendi quaerat ea soluta doloremque. Iure fugit, minima facere.</p> \
        </div> \
        ',
      },
    ],
  },
  {
    path: '/toast/',
    componentUrl: './pages/toast.html',
  },
  {
    path: '/toggle/',
    url: './pages/toggle.html',
  },
  {
    path: '/toolbar-tabbar/',
    componentUrl: './pages/toolbar-tabbar.html',
    routes: [
      {
        path: 'tabbar/',
        componentUrl: './pages/tabbar.html',
      },
      {
        path: 'tabbar-labels/',
        componentUrl: './pages/tabbar-labels.html',
      },
      {
        path: 'tabbar-scrollable/',
        componentUrl: './pages/tabbar-scrollable.html',
      },
      {
        path: 'toolbar-hide-scroll/',
        url: './pages/toolbar-hide-scroll.html',
      },
    ],
  },
  {
    path: '/tooltip/',
    componentUrl: './pages/tooltip.html',
  },
  {
    path: '/timeline/',
    url: './pages/timeline.html',
  },
  {
    path: '/timeline-vertical/',
    url: './pages/timeline-vertical.html',
  },
  {
    path: '/timeline-horizontal/',
    url: './pages/timeline-horizontal.html',
  },
  {
    path: '/timeline-horizontal-calendar/',
    url: './pages/timeline-horizontal-calendar.html',
  },
  {
    path: '/virtual-list/',
    componentUrl: './pages/virtual-list.html',
  },
  {
    path: '/virtual-list-vdom/',
    componentUrl: './pages/virtual-list-vdom.html',
  },
  {
    path: '/vi/',
    componentUrl: './pages/vi.html',
  },

  // Color Themes
  {
    path: '/color-themes/',
    componentUrl: './pages/color-themes.html',
  },

  // Page Loaders
  {
    path: '/page-loader-template7/:user/:userId/:posts/:postId/',
    templateUrl: './pages/page-loader-template7.html',
    // additional context
    options: {
      context: {
        foo: 'bar',
      },
    },
  },
  {
    path: '/page-loader-component/:user/:userId/:posts/:postId/',
    componentUrl: './pages/page-loader-component.html',
    // additional context
    options: {
      context: {
        foo: 'bar',
      },
    },
  },

  // Default route (404 page). MUST BE THE LAST
  {
   path: '(.*)',
   url: './pages/404.html',
   on: {
    pageInit: function (e, page) {

    }
   }
  },
];
