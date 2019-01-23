var routes = [
  // A partir de aquí lo mío
  // Index page
  {
    path: '/',
    url: './index.html',
    on: {
     pageInit: function (e, page) {
       /* Cerrar Pantalla de Login si ya nos conectamos */
       firebase.auth().onAuthStateChanged(function(user) {
        if (user && localStorage.vecino) {
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
          datosIniciales();
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
          datosIniciales();
         }
         app.loginScreen.close();
        }
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
      app.preloader.show();
      refVecinos.orderByKey().startAt("Total").on("value", function(data){
       $('#ingresos').html('');
       totalCuotas = 0;
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
         "</li>");
         totalCuotas =+ valor;
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
       if(!totalCuotas){
        $('.list.ingresos').remove();
    	  $('.page-content.ingresos').append('<div class="block-title">Nada en ingresos</div>');
       }
       app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
     },
    }
  },
  // ingresosDetalle page
  {
  path: '/ingresosDetalle/:index/',
  url: './pages/ingresosDetalle.html',
  on: {
   pageInit: function (e, page) {
    app.preloader.show();
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
     app.preloader.hide();
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
     actIngreso(cantidad);
    });
    $('.borrarIngreso').on('click', function() {
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
     /*refSettings.child('Años').on("value", function(data){
         valor = data.val().split(',');
         console.log(valor);*/
         self.pickerDevice = app.picker.create({
           inputEl: '#vecino',
           cols: [
             {
               textAlign: 'center',
               values: ['001','002','003','004','011','012','013','014','021','022','023','024']
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
     //})
    $('.insertarIngreso').on('click', function() {
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
      app.preloader.show();
      refGasto.orderByKey().startAt("Total").on("value", function(data){
       $('#gastos').html('');
       totalGastos = 0;
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
         "</li>");
         totalGastos =+ valor;
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
       if(!totalGastos){
        $('.list.gastos').remove();
      	$('.page-content.gastos').append('<div class="block-title">Nada en gastos</div>');
       }
       app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
     },
    }
  },
  // gastosDetalle page
  {
  path: '/gastosDetalle/:index/',
  url: './pages/gastosDetalle.html',
  on: {
   pageInit: function (e, page) {
    var id = page.route.params.index;
    var AñoGasto = id.substr(5);
    console.log("AñoGasto: "+ AñoGasto);
    console.log("GASTOS me envía: "+ id);
    var claveAño = id.substr(5, 4);
    app.preloader.show();
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
     app.preloader.hide();
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
     actGasto(cantidad);
    });
    $('.borrarGasto').on('click', function() {
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
     app.preloader.show();
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
     app.preloader.hide();
    $('.insertarGasto').on('click', function() {
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
      app.preloader.show();
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
      app.preloader.hide();
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
      var años = $('#años').val();
      if (!años) return;
      app.preloader.show();
      refSettings.update({
       Años: años}, function(error){
      if(error){
       console.log("Error Insertando/Actualizando");
       toastIconError.open();
      }else{
       console.log("Insertado/Actualizado correctamente");
       toastIconActualizado.open();
      }
      app.preloader.hide();
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
      app.preloader.show();
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
      $('.actualizarGasto').on('click', function() {
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
      app.preloader.hide();
    },
  }
  },
  // vecinos page
  {
  path: '/vecinos/',
  url: './pages/vecinos.html',
  on: {
   pageInit: function (e, page) {
    if(!app.acceso){
      console.log(localStorage.getItem("vecino"));
      var vecino = localStorage.getItem("vecino");
      app.preloader.show();
      refVecinos.orderByKey().startAt(vecino+"Pass").endAt(vecino+"Pass").on("value", function(data){
       $('#vecinos').html('');
       data.forEach(function(child){
        var clave = child.key;
        var valor = child.val();
        var claveVecino = clave.substr(0, 3);
        switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
        if(clave != claveVecino+"Acc"){
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
       });
       app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
    }else{
    app.preloader.show();
    refVecinos.orderByKey().startAt("001Acc").endAt("114Pass").on("value", function(data){
     $('#vecinos').html('');
     data.forEach(function(child){
      var clave = child.key;
      var valor = child.val();
      var claveVecino = clave.substr(0, 3);
      switch (claveVecino){case "001": vecino="bajo puerta 1"; break; case "002": vecino="bajo puerta 2"; break; case "003": vecino="bajo puerta 3"; break; case "004": vecino="bajo puerta 4"; break; case "011": vecino="primero puerta 1"; break;}
      if(clave == "001Pass"){
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
      }else if(clave != claveVecino+"Acc"){
       $('#vecinos').append(
       "<li class='item-content'>"+
       "<div class='item-inner'>"+
       "<div class='item-title'>Password: "+valor+"<div class='item-footer'>"+claveVecino+"</div>"+
       "</div>"+
       "<div class='item-after'>"+vecino+"</div>"+
       "</div>"+
       "</li>");
      }
     });
     app.preloader.hide();
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });
   }
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
  // verArchivo
  {
  path: '/verArchivo/:index/',
  url: './pages/verArchivo.html',
  on:{
   pageInit: function (e, page) {
   var id = page.route.params.index;
   console.log("El id es: " + id);
   app.preloader.show();
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
     app.preloader.hide();
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
    app.preloader.show();
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
     app.preloader.hide();
    }, function (errorObject) {
     console.log("Fallo leyendo: " + errorObject.code);
    });
    var storageService = firebase.storage();
    // asociamos el manejador de eventos sobre el INPUT FILE
    document.getElementById('campoarchivo').addEventListener('change', function(evento){
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
      app.preloader.show();
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
       app.preloader.hide();
      }, function (errorObject) {
       console.log("Fallo leyendo: " + errorObject.code);
      });
    }
  }
  },
  // notificaciones
  {
  path: '/notificaciones/',
  url: './pages/notificaciones.html',
  on:{
    pageInit: function (e, page){
      var myMessages = app.messages.create({
        el: '.messages'
      });
      var myMessagebar = app.messagebar.create({
       el: '.messagebar'
      });
      app.preloader.show();
      refMensajes.on("value", function(data){
        $('.messages').html('');
        //var ultimoAñoMesDia;
        var ultimaFecha;
        data.forEach(function(child){
          var clave = child.key;
          var valor = child.val();
          var claveVecino = clave.substr(13, 3);
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
          $('.messages').append(
            '<div class="messages-title">' + fecha + '</div>'
          )
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
      app.preloader.hide();

      $('.messagebar .link').on('click', function(){
        var refAhora = firebase.database().ref("Comunidad/Sesiones");
        var session = "session" + localStorage.vecino;
        refAhora.update({
         [session]: firebase.database.ServerValue.TIMESTAMP
        });
        var messageText = myMessagebar.getValue().replace(/\n/g, '<br>').trim();
        if (messageText.length === 0) return;
        myMessagebar.clear();
        refAhora.once("value", function(data){
          data.forEach(function(child){
            var clave = child.key;
            var valor = child.val();
            if(clave == "session" + localStorage.vecino){
             var ahora = valor;
             console.log(ahora);
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
  },
];
