var config = {
 apiKey: "AIzaSyDM-9jHFuajfKvMokm-P6trYunmVUhif6M",
 authDomain: "comunidad-690a0.firebaseapp.com",
 databaseURL: "https://comunidad-690a0.firebaseio.com",
 projectId: "comunidad-690a0",
 storageBucket: "comunidad-690a0.appspot.com",
 messagingSenderId: "588548499692"
};

firebase.initializeApp(config);

// Referencias a firebase
var rootComunidad = firebase.database().ref();
var refComunidad = firebase.database().ref("Comunidad/");
var refVecinos = firebase.database().ref("Comunidad/Vecinos");
var refGasto = firebase.database().ref("Comunidad/Gasto");
var refVinculos = firebase.database().ref("Comunidad/Vinculos");
var refMensajes = firebase.database().ref("Comunidad/Mensajes");
var refSettings = firebase.database().ref("Comunidad/Settings");

/*if (Framework7.device.webView) {
  alert('SI Home Screen');
}else{
  alert('NO Home Screen');
}*/

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
// Datos iniciales
function datosIniciales(){
  //Trozo añadido para mostrar Saldo, Gastos e Ingresos inicialmente ademas de años a mostrar
  app.preloader.show();
  refComunidad.orderByKey().startAt("Z").on("value", function(data){
   data.forEach(function(child){
    var clave = child.key;
    var valor = child.val();
    if(clave == "ZIngresos"){
     $('#totalIngresos').text(valor+"€");
    }else if(clave == "ZGastos"){
     $('#totalGastos').text(valor+"€");
    }else if(clave == "ZSaldo"){
     $('#saldo').text(valor+"€");
    }
    console.log(clave + ": " + valor);
   });
   app.preloader.hide();
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
  //Fin de Trozo añadido para mostrar Saldo, Gastos e Ingresos inicialmente ademas de años a mostrar
}

// Ingresos
function actIngreso(cant){
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
  app.preloader.show();
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
    app.router.back();
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
  app.preloader.hide();
 }
}

function borrarIngreso(cant){
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
  app.preloader.show();
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
  app.preloader.hide();
 }
}

function insIngreso(){
 var valorVecino = $('#vecino').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var valorCantidad = $('#cantidad').val();
 if (!$('#vecino')[0].checkValidity() || !año.checkValidity() || !mes.checkValidity() || !cantidad.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoVecinoMes = valorAño+valorVecino+valorMes;
  var cant = parseInt(valorCantidad, 10);
  console.log(AñoVecinoMes + ":" + cant);
  app.preloader.show();
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
  });
  app.preloader.hide();
 }
}
// Fin ingresos

function actualizarZIngresos(cant, sum){
 app.preloader.show();
 var ZIngresos = refComunidad.child("ZIngresos");
 ZIngresos.transaction(function(loquehay) {
  if(sum){
   return loquehay + cant;
  }else{
   return loquehay - cant;
  }
 });
 app.preloader.hide();
 actualizarZSaldo(cant, sum);
}

function actualizarZGastos(cant, sum){
 app.preloader.show();
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
 app.preloader.hide();
}

function actualizarZSaldo(cant, sum){
 app.preloader.show();
 var ZSaldo = refComunidad.child("ZSaldo");
 ZSaldo.transaction(function(loquehay) {
  if(sum){
   return loquehay + parseInt(cant, 10);
  }else{
   return loquehay - cant;
  }
 });
 app.preloader.hide();
}

// gastos
function actGasto(cant){
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
  app.preloader.show();
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
    app.router.back();
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
  app.preloader.hide();
 }
}

function borrarGasto(cant){
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
  app.preloader.show();
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
   }else{
    console.log("El gasto " + AñoGastoMes + " no se borró. No existía.");
    toastIconError.open();
   }
  });
  app.preloader.hide();
 }
}

function insGasto(){
 var valorGasto = $('#gasto').val();
 var valorAño = $('#año').val();
 var valorMes = $('#mes').val();
 switch (valorMes) {case "Ene": valorMes="01"; break; case "Feb": valorMes="02"; break; case "Mar": valorMes="03"; break; case "Abr": valorMes="04"; break; case "May": valorMes="05"; break; case "Jun": valorMes="06"; break; case "Jul": valorMes="07"; break; case "Ago": valorMes="08"; break; case "Sep": valorMes="09"; break; case "Oct": valorMes="10"; break; case "Nov": valorMes="11"; break; case "Dic": valorMes="12"; break;}
 var valorCantidad = $('#cantidad').val();
 if (!gasto.checkValidity() || !año.checkValidity() || !mes.checkValidity() || !cantidad.checkValidity()) {
  console.log("Rellena todo tito");
  toastIconError.open();
 }else{
  var AñoGastoMes = valorAño+valorGasto+valorMes;
  var cant = parseInt(valorCantidad, 10);
  console.log(AñoGastoMes + ":" + cant);
  app.preloader.show();
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
  });
  app.preloader.hide();
 }
}
// Fin gastos

// Vecinos
function actVecino(vecino, password){
 var password = $('#password').val();
 console.log("recibo: "+ vecino +" "+ password);
  console.log(vecino + ":" + password);
  app.preloader.show();
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
  app.preloader.hide();
}

// Vinculos
function insVinculo(clave, valor){
  var clave = clave.substr(0, clave.indexOf("."));
  console.log(clave, valor);
  app.preloader.show();
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
  app.preloader.hide();
}

// borrarDocumento
function borrarDocumento(clave){
 var archivoStore = 'micarpeta/'+clave.substr(clave.indexOf("%2F")+3, clave.indexOf("?")-3);
 var archivoStoreSin = archivoStore.replace(/%20/g, " ");
 var archivoVinculado = clave.substr(clave.indexOf("%2F")+3, clave.indexOf(".")-3);
 var archivoVinculadoSin = archivoVinculado.replace(/%20/g, " ");
 console.log(clave+"-"+archivoVinculado+"-"+archivoStore);
 var storage = firebase.storage();
 var refStorage = storage.ref();
 // Create a reference to the file to delete
 var refDesert = refStorage.child(archivoStoreSin);
 app.preloader.show();
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
 app.preloader.hide();
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
var toastIconBorrado = app.toast.create({
  icon: app.theme === 'ios' ? '<i class="f7-icons">close</i>' : '<i class="material-icons">close</i>',
  text: 'Borrado',
  position: 'center',
  closeTimeout: 2000,
});
