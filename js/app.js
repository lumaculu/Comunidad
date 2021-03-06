var config = {
 apiKey: "AIzaSyDM-9jHFuajfKvMokm-P6trYunmVUhif6M",
 authDomain: "comunidad-690a0.firebaseapp.com",
 databaseURL: "https://comunidad-690a0.firebaseio.com",
 projectId: "comunidad-690a0",
 storageBucket: "comunidad-690a0.appspot.com",
 messagingSenderId: "588548499692"
};

firebase.initializeApp(config);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("serviceworker.js").then(function(registration) {
	//console.log("Service Worker registrado con scope:", registration.scope);
  }).catch(function(err) {
    console.log("Service Worker registro fallido:", err);
  });
}

// Referencias a firebase
var rootComunidad = firebase.database().ref();
var refComunidad = firebase.database().ref("Comunidad/");
var refVecinos = firebase.database().ref("Comunidad/Vecinos");
var refGasto = firebase.database().ref("Comunidad/Gasto");
var refVinculos = firebase.database().ref("Comunidad/Vinculos");
var refMensajes = firebase.database().ref("Comunidad/Mensajes");
var refSesiones = firebase.database().ref("Comunidad/Sesiones");
var refSettings = firebase.database().ref("Comunidad/Settings");
var refActualizarApp = firebase.database().ref("Comunidad/Actualizar");

// Comprobar conexión
/*window.addEventListener('offline', function(){
  console.log('Estás desconectado tito');
  notificationFulldesconectado.open();
})
window.addEventListener('online', function(){
  console.log('Estás conectado tito');
  notificationFullconectado.open();
})*/

// Dom7
var $ = Dom7;

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

// Init App
var app = new Framework7({
  id: 'io.comunidad.testapp',
  root: '#app',
  theme: theme,
  dialog: {
    title: 'Comunidad',
    buttonOk: 'Ok',
    buttonCancel: 'Cancelar'
  },
  data: function () {
    return {
      user: {
        firstName: 'Antonio',
        lastName: 'Búfalo',
      },
    };
  },
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hola Titos!');
    },
  },
  routes: routes,
  vi: {
    placementId: 'pltd4o7ibb9rc653x14',
  },
});
/* Logearse por primera vez */
$('.login-screen-content .list-button').on('click', function(){
 const email = $('#username').val();
 const password = $('#password').val();
 var vecino = email.substr(0, 3);
 firebase.auth().signInWithEmailAndPassword(email, password)
 .then(function(user) {
  firebase.auth().onAuthStateChanged(function(user) {
   if (user) {
    var refAcc = firebase.database().ref("Comunidad/Vecinos/"+vecino+"Acc");
    refAcc.on('value', function(snapshot) {
     var valor = snapshot.val();
     if(valor){
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
      app.acceso = true;
      localStorage.setItem("acceso", app.acceso);
      localStorage.setItem("vecino", vecino);
     }else{
      console.log("Acceso: Usuario");
      app.acceso = false;
	    localStorage.setItem("acceso", app.acceso);
      localStorage.setItem("vecino", vecino);
      $('.quitar').hide();
      var documentos = $('.toolbar-inner a').eq(3);
      documentos.attr({
        href: '/subirArchivo2/'
      })
      var vecinos = $('.navbar-inner a').eq(0);
      vecinos.attr({
        href: '/vecinos/'
      })
     }
    });
	  if(!app.acceso){
     $('.quitar').hide();
    }
    datosInicio();
    datosIniciales();
    app.loginScreen.close();
   }else{ // Fin de user, dentro del else no hay user
    toastIconError.open();
    $('.block-footer').text("Login o Password incorrectos");
   }
  }) // Fin de onAuthStateChanged
 }) // Fin de signInWithEmailAndPassword
 .catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode, errorMessage);
  console.log("Login o Password incorrectos");
  toastIconError.open();
  $('.block-footer').text("Login o Password incorrectos");
 });
});
// Datos inicio
function datosInicio(){
/*refComunidad.orderByKey().startAt("Z").on("value", function(data){
 borrarTabladeIndexedDB('Inicio');
 data.forEach(function(child){
  var clave = child.key;
  var valor = child.val();
  añadeDatosaIndexedDB('Inicio', {clave, valor});
  if(clave == "ZIngresos"){
   $('#totalIngresos').text(valor+"€");
  }else if(clave == "ZGastos"){
   $('#totalGastos').text(valor+"€");
  }else if(clave == "ZSaldo"){
   $('#saldo').text(valor+"€");
  }
  console.log(clave + ": " + valor);
 });
}, function (errorObject) {
  console.log("Fallo leyendo: " + errorObject.code);
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
});*/
refComunidad.orderByKey().startAt("Z").on("value", function(data){
 var ZIngresos = data.val().ZIngresos;
 var ZGastos = data.val().ZGastos;
 var ZSaldo = data.val().ZSaldo;
 $('#totalIngresos').text(ZIngresos+"€");
 $('#totalGastos').text(ZGastos+"€");
 $('#saldo').text(ZSaldo+"€");
 //borrarTabladeIndexedDB('Inicio');
 /*console.log(DATOS_INICIO);
 if(DATOS_INICIO == false){
 data.forEach(function(child){
  var clave = child.key;
  var valor = child.val();
  añadeDatosaIndexedDB('Inicio', {clave, valor});
 });
 }else{
  modificarTablaenIndexedDB('Inicio', data);
 }
 DATOS_INICIO = true;
 console.log(DATOS_INICIO);*/
 obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
  if(Inicio == 0){
  console.log("Inicio es 0");
  data.forEach(function(child){
   var clave = child.key;
   var valor = child.val();
   añadeDatosaIndexedDB('Inicio', {clave, valor});
  });
  }else{
   var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
   var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
   if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
    console.log("Los ingresos o gastos han cambiado");
    modificarTablaenIndexedDB('Inicio', data);
   }else{
    console.log("Los ingresos o gastos son los mismos");
   }
  }
  /*var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
  var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
  if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
   console.log("Los ingresos o gastos han cambiado");
   modificarTablaenIndexedDB("Inicio", data);
  }else{
   console.log("Los ingresos o gastos son los mismos");
 }*/
})
}, function (errorObject) {
  console.log("Fallo leyendo: " + errorObject.code);
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
// Fin datos inicio
// Datos iniciales
function datosIniciales(){
  //Trozo añadido para mostrar Saldo, Gastos e Ingresos inicialmente ademas de años a mostrar
  DATOS_INICIALES = true;
  refComunidad.orderByKey().startAt("Z").on("value", function(data){
   var ZIngresos = data.val().ZIngresos;
   var ZGastos = data.val().ZGastos;
   var ZSaldo = data.val().ZSaldo;
   $('#totalIngresos').text(ZIngresos+"€");
   $('#totalGastos').text(ZGastos+"€");
   $('#saldo').text(ZSaldo+"€");
   if(DATOS_INICIO == false){
     modificarTablaenIndexedDB("Inicio", data);
   }
   /*obtenResultadodeIndexedDB('Inicio').then(function(Inicio){
    var gastosIndexedDB = Object.values(Inicio[0]).toString().substr(8);
    var ingresosIndexedDB = Object.values(Inicio[1]).toString().substr(10);
    if(data.val().ZGastos != gastosIndexedDB || data.val().ZIngresos != ingresosIndexedDB){
     console.log("Los ingresos o gastos han cambiado");
     modificarTablaenIndexedDB("Inicio", data);
    }else{
     console.log("Los ingresos o gastos son los mismos");
    }
  });*/
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
  refGasto.on("value", function(data){ // Inicio de meter Firebase db en IndexedDB
   borrarTabladeIndexedDB('Gasto');
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    //console.log(clave + ": " + valor);
    añadeDatosaIndexedDB('Gasto', {clave, valor});
   });
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  });
  refMensajes.on("value", function(data){
   borrarTabladeIndexedDB('Mensajes');
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    //console.log(clave + ": " + valor);
    añadeDatosaIndexedDB('Mensajes', {clave, valor});
   });
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  });
  refSesiones.on("value", function(data){
   borrarTabladeIndexedDB('Sesiones');
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    //console.log(clave + ": " + valor);
    añadeDatosaIndexedDB('Sesiones', {clave, valor});
   });
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  });
  refSettings.on("value", function(data){
   borrarTabladeIndexedDB('Settings');
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    //console.log(clave + ": " + valor);
    añadeDatosaIndexedDB('Settings', {clave, valor});
   });
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  });
  refVecinos.on("value", function(data){
   borrarTabladeIndexedDB('Vecinos');
   if(app.acceso){
    data.forEach(function(child){
     var clave = child.key;
     var valor = child.val();
     //console.log(clave + ": " + valor);
     añadeDatosaIndexedDB('Vecinos', {clave, valor});
    });
   }else{
    data.forEach(function(child){
     var clave = child.key;
     var valor = child.val();
     console.log(clave + ": " + valor);
     if(!clave.startsWith("0") && !clave.startsWith("1"))
     añadeDatosaIndexedDB('Vecinos', {clave, valor});
     if(clave == localStorage.vecino+"Pass")
     añadeDatosaIndexedDB('Vecinos', {clave, valor});
    });
   }
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  });
  refVinculos.on("value", function(data){
   borrarTabladeIndexedDB('Vinculos');
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    //console.log(clave + ": " + valor);
    añadeDatosaIndexedDB('Vinculos', {clave, valor});
   });
  }, function (errorObject) {
    console.log("Fallo leyendo: " + errorObject.code);
  }); // Fin de meter Firebase db en indexedDB
  //Fin de Trozo añadido para mostrar Saldo, Gastos e Ingresos inicialmente ademas de años a mostrar
}

// Ingresos
function insIngreso(){
 if(!navigator.onLine)
 notificationFullinsIngreso.open();
 var valorVecino = $('#vecino').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var valorCantidad = $('#cantidad').val();
 //if (!$('#vecino')[0].checkValidity() || !$('#año')[0].checkValidity() || !$('#mes')[0].checkValidity() || !$('#cantidad')[0].checkValidity()) {
 if(valorVecino == "" || valorAño == "" || valorMes == "" || valorCantidad == ""){
  app.dialog.alert("¡Rellena todo!");
 }else{
  var AñoVecinoMes = valorAño+valorVecino+valorMes;
  var cant = parseInt(valorCantidad, 10);
  console.log(AñoVecinoMes + ":" + cant);
  refVecinos.child(AñoVecinoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    console.log("El ingreso " + AñoVecinoMes + " ya exite. Actualízalo mejor.");
    toastIconError.open();
   }else{
    console.log("El ingreso " + AñoVecinoMes + " no existe. Lo insertaremos.");
    var AñoVecino = AñoVecinoMes.substr(0, 7);
    refVecinos.update({
     [AñoVecinoMes]: cant}, function(error){
     if(error){
      console.log("Error Insertando/Actualizando");
      toastIconError.open();
     }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconInsertado.open();
     }
    });
    var AñoVecino = refVecinos.child("Total"+AñoVecino);
    AñoVecino.transaction(function(loquehay) {
     return loquehay + cant;
    });
   actualizarZIngresos(cant, true);
   }
   app.router.navigate('/');
  });
 }
}

function actIngreso(cant){
 if(!navigator.onLine)
 notificationFullmodificar.open();
 var valorVecino = $('#vecino').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var cantInicial = cant;
 var cantFinal = $('#cantidad').val();
 if (!$('#vecino')[0].checkValidity() || !año.checkValidity() || !mes.checkValidity() || !cantidad.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoVecinoMes = valorAño+valorVecino+valorMes;
  var cantFinalParseada = parseInt(cantFinal, 10);
  console.log(AñoVecinoMes + ":" + cantFinalParseada);
  refVecinos.child(AñoVecinoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    console.log("El ingreso " + AñoVecinoMes + " y con valor inicial: " + cantInicial + " ya exite. Actualízalo mejor para que sea de valor: " + cantFinalParseada);
    var AñoVecino = AñoVecinoMes.substr(0, 7);
    if(cantInicial < cantFinalParseada){
     var actCantidad = Math.abs(cantInicial - cantFinalParseada);
    }else{
     var actCantidad = -Math.abs(cantInicial - cantFinalParseada);
    }
    refVecinos.update({
    [AñoVecinoMes]: cantFinalParseada}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    var TotalAñoVecino = refVecinos.child("Total"+AñoVecino);
     TotalAñoVecino.transaction(function(loquehay) {
     return (loquehay - cantInicial) + cantFinalParseada;
    });
    actualizarZIngresos(actCantidad, true);
    app.router.navigate('/');
   }else{
    var AñoVecino = AñoVecinoMes.substr(0, 7);
    console.log("El ingreso " + AñoVecinoMes + " no existe. Lo insertaremos.");
    refVecinos.update({
    [AñoVecinoMes]: cantFinalParseada}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    var TotalAñoVecino = refVecinos.child("Total"+AñoVecino);
     TotalAñoVecino.transaction(function(loquehay) {
     return loquehay + cantFinalParseada;
    });
    actualizarZIngresos(cantFinalParseada, true);
    app.router.back();
   }
  });
 }
}

function borrarIngreso(cant){
 if(!navigator.onLine)
 notificationFullborrar.open();
 var valorVecino = $('#vecino').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 if (!$('#vecino')[0].checkValidity() || !año.checkValidity() || !mes.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoVecinoMes = valorAño+valorVecino+valorMes;
  var AñoVecino = AñoVecinoMes.substr(0, 7);
  refVecinos.child(AñoVecinoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    refVecinos.child(AñoVecinoMes).remove();
    console.log("El ingreso " + AñoVecinoMes + " se borró.");
    toastIconBorrado.open();
    var TotalAñoVecino = refVecinos.child("Total"+AñoVecino);
    TotalAñoVecino.transaction(function(loquehay) {
     return loquehay - cant;
    });
    actualizarZIngresos(cant);
    app.router.navigate('/');
   }else{
    console.log("El ingreso " + AñoVecinoMes + " no se borró. No existía.");
    toastIconError.open();
   }
  });
 }
}
// Fin ingresos

function actualizarZIngresos(cant, sum){
 //app.preloader.show();
 var ZIngresos = refComunidad.child("ZIngresos");
 ZIngresos.transaction(function(loquehay) {
  if(sum){
   return loquehay + cant;
  }else{
   return loquehay - cant;
  }
 });
 //app.preloader.hide();
 actualizarZSaldo(cant, sum);
}

function actualizarZGastos(cant, sum){
 //app.preloader.show();
 var ZGastos = refComunidad.child("ZGastos");
 ZGastos.transaction(function(loquehay) {
  if(sum){
   actualizarZSaldo(cant, false);
   return loquehay + cant;
  }else{
   actualizarZSaldo(cant, true);
   return loquehay - cant;
  }
 });
 //app.preloader.hide();
}

function actualizarZSaldo(cant, sum){
 //app.preloader.show();
 var ZSaldo = refComunidad.child("ZSaldo");
 ZSaldo.transaction(function(loquehay) {
  if(sum){
   return loquehay + parseInt(cant, 10);
  }else{
   return loquehay - cant;
  }
 });
 //app.preloader.hide();
}

// gastos
function insGasto(){
 if(!navigator.onLine)
 notificationFullinsGasto.open();
 var valorGasto = $('#gasto').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var valorCantidad = $('#cantidad').val();
 //if (!gasto.checkValidity() || !año.checkValidity() || !mes.checkValidity() || !cantidad.checkValidity()) {
 if(valorGasto == "" || valorAño == "" || valorMes == "" || valorCantidad == ""){
  app.dialog.alert("¡Rellena todo!");
 }else{
  var AñoGastoMes = valorAño+valorGasto+valorMes;
  var cant = parseInt(valorCantidad, 10);
  console.log(AñoGastoMes + ":" + cant);
  refGasto.child(AñoGastoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    console.log("El gasto " + AñoGastoMes + " ya exite. Actualízalo mejor.");
    toastIconError.open();
   }else{
    console.log("El gasto " + AñoGastoMes + " no existe. Lo insertaremos.");
    var AñoGasto = AñoGastoMes.substr(0, (AñoGastoMes.length)-2);
    refGasto.update({
     [AñoGastoMes]: cant}, function(error){
     if(error){
      console.log("Error Insertando/Actualizando");
      toastIconError.open();
     }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconInsertado.open();
     }
    });
    var AñoGasto = refGasto.child("Total"+AñoGasto);
    AñoGasto.transaction(function(loquehay) {
     return loquehay + cant;
    });
   actualizarZGastos(cant, true);
   }
   app.router.navigate('/');
  });
 }
}

function actGasto(cant){
 if(!navigator.onLine)
 notificationFullmodificar.open();
 var valorGasto = $('#gasto').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var cantInicial = cant;
 var cantFinal = $('#cantidad').val();
 if (!gasto.checkValidity() || !año.checkValidity() || !mes.checkValidity() || !cantidad.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoGastoMes = valorAño+valorGasto+valorMes;
  var cantFinalParseada = parseInt(cantFinal, 10);
  console.log(AñoGastoMes + ":" + cantFinalParseada);
  refGasto.child(AñoGastoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    console.log("El gasto " + AñoGastoMes + " y con valor inicial: " + cantInicial + " ya exite. Actualízalo mejor para que sea de valor: " + cantFinalParseada);
    var AñoGasto = AñoGastoMes.substr(0, (AñoGastoMes.length)-2);
    if(cantInicial < cantFinalParseada){
     var actCantidad = -Math.abs(cantInicial - cantFinalParseada);
    }else{
     var actCantidad = Math.abs(cantInicial - cantFinalParseada);
    }
    refGasto.update({
    [AñoGastoMes]: cantFinalParseada}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    var TotalAñoGasto = refGasto.child("Total"+AñoGasto);
    TotalAñoGasto.transaction(function(loquehay) {
     return (loquehay - cantInicial) + cantFinalParseada;
    });
    actualizarZGastos(actCantidad, false);
    app.router.navigate('/');
   }else{
    var AñoGasto = AñoGastoMes.substr(0, (AñoGastoMes.length)-2);
    console.log("El gasto " + AñoGastoMes + " no existe. Lo insertaremos.");
    refGasto.update({
    [AñoGastoMes]: cantFinalParseada}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    var TotalAñoGasto = refGasto.child("Total"+AñoGasto);
    TotalAñoGasto.transaction(function(loquehay) {
     return loquehay + cantFinalParseada;
    });
    actualizarZGastos(cantFinalParseada, true);
    app.router.back();
   }
  });
 }
}

function borrarGasto(cant){
 if(!navigator.onLine)
 notificationFullborrar.open();
 var valorGasto = $('#gasto').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 if (!gasto.checkValidity() || !año.checkValidity() || !mes.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoGastoMes = valorAño+valorGasto+valorMes;
  var AñoGasto = AñoGastoMes.substr(0, (AñoGastoMes.length)-2);
  refGasto.child(AñoGastoMes).once('value', function(snapshot) {
   if (snapshot.exists()) {
    refGasto.child(AñoGastoMes).remove();
    console.log("El gasto " + AñoGastoMes + " se borró.");
    toastIconBorrado.open();
    var TotalAñoGasto = refGasto.child("Total"+AñoGasto);
    TotalAñoGasto.transaction(function(loquehay) {
     return loquehay - cant;
    });
    actualizarZGastos(cant);
    app.router.navigate('/');
   }else{
    console.log("El gasto " + AñoGastoMes + " no se borró. No existía.");
    toastIconError.open();
   }
  });
 }
}
// Fin gastos

// Vecinos
function actVecino(vecino, password){
 var password = $('#password').val();
 console.log("recibo: "+ vecino +" "+ password);
  console.log(vecino + ":" + password);
  refVecinos.child(vecino+"Pass").once('value', function(snapshot) {
   if (snapshot.exists()) {
    refVecinos.update({
    [vecino+"Pass"]: password}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    app.router.back();
   }
  });
  /*refVecinos.child(vecino+"Acc").once('value', function(snapshot) {
   if (snapshot.exists()) {
    refVecinos.update({
    [vecino+"Acc"]: acceso}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
    app.router.back();
   }
 });*/
}
function actAcceso(vecino, acceso){
 app.dialog.confirm('¿Cambiar el acceso, seguro?', 'Aviso Importante', function () {
  refVecinos.child(vecino+"Acc").once('value', function(snapshot) {
   if (snapshot.exists()) {
    refVecinos.update({
    [vecino+"Acc"]: acceso}, function(error){
    if(error){
     console.log("Error Insertando/Actualizando");
     toastIconError.open();
    }else{
     console.log("Insertado/Actualizado correctamente");
     toastIconActualizado.open();
    }
    });
   }
 });
 }, function(){
   if($('#acceso'+vecino).is(":checked")){
    $('#acceso'+vecino).prop('checked', false);
   }else{
    $('#acceso'+vecino).prop('checked', true);
   }
 })
}

function actApp(){
 var actualizar = parseInt($('#version').val(), 10);
 app.dialog.confirm('¿Necesita actualizar, seguro?', 'Aviso Importante', function () {
  refComunidad.once('value', function(snapshot) {
   if (snapshot.exists()) {
    refComunidad.update({
    Actualizar: actualizar}, function(error){
    if(error){
     console.log("Error Actualizando la App");
     toastIconError.open();
    }else{
     console.log("Actualizada la App correctamente");
     toastIconAppActualizada.open();
    }
    });
   }
 });
 }, function(){
   if($('#actApp').is(":checked")){
    $('#actApp').prop('checked', false);
   }else{
    $('#actApp').prop('checked', true);
   }
 })
}

// Vinculos
function insVinculo(clave, valor){
  var clave = clave.substr(0, clave.indexOf("."));
  console.log(clave, valor);
  //app.preloader.show();
  refVinculos.child(clave).once('value', function(snapshot) {
    console.log("El vinculo " + clave + " no existe. Lo insertaremos.");
    refVinculos.update({
     [clave]: valor}, function(error){
     if(error){
      console.log("Error Insertando/Actualizando");
      //toastIconError.open();
     }else{
      console.log("Insertado/Actualizado correctamente");
      //toastIconInsertado.open();
     }
    });
  });
  //app.preloader.hide();
}

// borrarDocumento
function borrarDocumento(clave){
 if(!navigator.onLine){
  notificationFullrestringido.open();
  return;
 }
 var archivoStore = 'micarpeta/'+clave.substr(clave.indexOf("%2F")+3, clave.indexOf("?")-3);
 var archivoStoreSin = archivoStore.replace(/%20/g, " ");
 var archivoVinculado = clave.substr(clave.indexOf("%2F")+3, clave.indexOf(".")-3);
 var archivoVinculadoSin = archivoVinculado.replace(/%20/g, " ");
 console.log(clave+"-"+archivoVinculado+"-"+archivoStore);
 var storage = firebase.storage();
 var refStorage = storage.ref();
 // Create a reference to the file to delete
 var refDesert = refStorage.child(archivoStoreSin);
 //app.preloader.show();
 refDesert.delete().then(function() {
  console.log("documento borrado satisfactoriamente");
 }).catch(function(error) {
  console.log("error borrando documento: "+archivoStoreSin);
 });
 refVinculos.child(archivoVinculadoSin).once('value', function(snapshot) {
  if (snapshot.exists()) {
   refVinculos.child(archivoVinculadoSin).remove();
   console.log("El vínculo " + archivoVinculadoSin + " se borró.");
   toastIconBorrado.open();
  }else{
   console.log("El vínculo " + archivoVinculadoSin + " no se borró. No existía.");
   toastIconError.open();
  }
 });
 //app.preloader.hide();
 //app.dialog.alert('Gracias, item borrado! '+archivoVinculadoSin);
}

var toastIconError = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">info</i>' : '<i class="material-icons">info</i>',
  text: 'Error',
  position: 'center',
  closeTimeout: 2000,
});
var toastIconInsertado = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">check</i>' : '<i class="material-icons">check</i>',
  text: 'Insertado',
  position: 'center',
  closeTimeout: 2000,
});
var toastIconActualizado = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">check</i>' : '<i class="material-icons">check</i>',
  text: 'Actualizado',
  position: 'center',
  closeTimeout: 2000,
});
var toastIconAppActualizada = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">check</i>' : '<i class="material-icons">check</i>',
  text: 'App Actualizada',
  position: 'center',
  closeTimeout: 2000,
});
var toastIconBorrado = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">close</i>' : '<i class="material-icons">close</i>',
  text: 'Borrado',
  position: 'center',
  closeTimeout: 2000,
});
// Create notification with close button
var notificationFulldesconectado = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Posiblemente datos no actualizados',
  closeTimeout: 3000,
});
var notificationFullconectado = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Vuelves a estar conectado!',
  text: 'Los datos volverán a actualizarse',
  closeTimeout: 3000,
});
var notificationFullinsIngreso = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Ingreso pendiente hasta estar conectado',
  closeTimeout: 3000,
});
var notificationFullborrar = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Borrado pendiente hasta estar conectado',
  closeTimeout: 3000,
});
var notificationFullinsGasto = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Gasto pendiente hasta estar conectado',
  closeTimeout: 3000,
});
var notificationFullmodificar = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Modificación pendiente hasta estar conectado',
  closeTimeout: 3000,
});
var notificationFullrestringido = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'Operación sólo disponible cuando estés conectado',
  closeTimeout: 3000,
});
var notificationFullDocumentos = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'No podrás descargar documentos hasta estar conectado',
  closeTimeout: 3000,
});
var notificationFullSettingsGastos = app.notification.create({
  icon: '<i class="icon icon-f7"></i>',
  title: 'Comunidad',
  subtitle: '¡Estás desconectado!',
  text: 'No podrás modificar gastos hasta estar conectado',
  closeTimeout: 3000,
});
