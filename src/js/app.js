/**
             * Welcome to Pebble.js!
             *
             * This is where you write your app.
             */
//Inicia Clay
var Settings = require('settings');
var Clay = require('./clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, {autoHandleEvents: false});

Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);

  // Save the Clay settings to the Settings module. 
  Settings.option(dict);
});



//Finaliza Clay
var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var options = Settings.option();
if (options.email === undefined || options.email === null) {
  var cardConfig = new UI.Card();
  cardConfig.title('No Data Found');
  cardConfig.subtitle('Run App Setup');
  cardConfig.body('');
  cardConfig.show();
  setTimeout(function() {
    subcategoriasMenu.hide();
    categoriasMenu.hide();
    cardExito.hide();
    wind.hide();
    cardConfig.hide();
    wind.hide();
    wind.hide();
  }, 2000);
}  


console.log("Pre apiLogin");

console.log("Email is " + options.email);



var apikey = '';
//var user = {name:'sibero80@gmail.com', password:'5familiar5'};
var user = {name:options.email, password:options.psswd};
var recurrTag = options.transTag;

var numindex = '0';
var numposx = [22, 49, 83, 109];
var numsposx = [25, 52, 86, 113];

var categoriasMenu = {};
var subcategoriasMenu = {};
var Categorias = [];
var Categorias1 = [];
var itemsCategorias = {};
var cardExito = {};
var selectedCat = '';
var selectedBudget = '';

var rawTrans = '';
var transTitle = '';
var transSubTitle = '';
var transMonto = '';
var transCuenta = '';
var selectedCatPers = '';


var wind = new UI.Window();
var string = new UI.Text({
  position: new Vector2(0, 54),
  size: new Vector2(144, 168),
  color: 'white',
  font: 'bitham-42-light',
  text: '$     ,      '
});
wind.add(string);

for (var i = 0; i < numsposx.length; i++) {
  eval('var num' + i + '= new UI.Text({  position: new Vector2(' + numsposx[i] + ', 54),  size: new Vector2(144, 168),  color: "white",  font: "bitham-42-light",  text: "0"});');
  eval('wind.add(num' + i + ')');
}

var rect = new UI.Rect({ 
  position: new Vector2(22, 62),
  size: new Vector2(32, 40), 
  backgroundColor: 'clear',
  borderColor: 'white'  
});
wind.add(rect);

var cardLoading = new UI.Card();
cardLoading.title('Control Gastos');
cardLoading.subtitle('Conectando...');
cardLoading.body('');
cardLoading.show();



console.log("Pre apiLogi");
//apiLogin();

apiLogin(function(){
  getTrans(function(){
    getCat(function(){
      clickCatMenu(function(){
        clickSubcat(function(){
          clickPerson();
        });
      });
    });
  });
});



console.log("Post apiLogi");


//getCat(rawTrans);








function apiLogin(callback) {
  console.log("test aPiLogin");
  ajax({
    method: 'POST',
    url: 'https://www.buxfer.com/api/login?userid=' + user.name + '&password=' + user.password,
    type: 'json'
  },
       function(data) {
         console.log("Sucessful Buxfer login! " + JSON.stringify(data));
         console.log('token: ' + data.response.token);
         console.log('status: ' + data.response.status);
         console.log('request_id: ' + data.response.request_id);
         apikey = data.response.token;
         console.log('apikey: ' + apikey);
         callback();
       },
       function(error) {
         var cardLoginError = new UI.Card();
         cardLoginError.title('Login Error');
         cardLoginError.subtitle('Check User Details');
         cardLoginError.body('');
         cardLoginError.show();
         setTimeout(function() {
           cardLoginError.hide();
           cardLoading.hide();
           cardExito.hide();
         }, 2000);
         console.log('Falló autenticación Buxfer: ' + JSON.stringify(error));
         console.log('transactionAdded: ' + error.message);
         console.log('request_id: ' + error.response.request_id);
       }
      );
}

function getTrans(callback) {
  console.log('Succes Get Trans https://www.buxfer.com/api/transactions?token=' + apikey + '&tagName=' + recurrTag);
  console.log(apikey);
  ajax({
    method: 'POST',
    url: 'https://www.buxfer.com/api/transactions?token=' + apikey + '&tagName=' + recurrTag,
    type: 'json'
  },
       function(data) {
         console.log("Sucessful trans get! " + options.transTag );
         rawTrans = data;
         console.log(JSON.stringify(rawTrans));
         if (rawTrans.response.numTransactions === 0) {
           var cardNoTrans = new UI.Card();
           cardNoTrans.title('Zero Transactions');
           cardNoTrans.subtitle('Check Selected Tag');
           cardNoTrans.body('');
           cardNoTrans.show();
           setTimeout(function() {
             cardNoTrans.hide();
             cardLoading.hide();
             cardExito.hide();
           }, 2000);
         }
         callback();
       },
       function(error) {
         var cardNoTrans = new UI.Card();
         cardNoTrans.title('Zero Transactions');
         cardNoTrans.subtitle('Check Selected Tag');
         cardNoTrans.body('');
         cardNoTrans.show();
         setTimeout(function() {
           cardNoTrans.hide();
           cardLoading.hide();
           cardExito.hide();
         }, 2000);
         console.log('https://www.buxfer.com/api/transactions?token=' + apikey + '&tagName=' + recurrTag);
         console.log('Fallo obteniendo transferencias: ' + JSON.stringify(error));
         console.log('Request_id: ' + error.error.request_id);
         console.log('Message: ' + error.error.message);
         console.log('request_id: ' + error.error.request_id);
       }
      );
}

function postTrans(f, g, h, i) {
  //function postTrans(e.item.title, e.item.monto, selected , e.item.subtitle)
  console.log('PostTrans URL: https://www.buxfer.com/api/add_transaction?token=' + apikey + '&format=sms&text=' + f + ' ' + g + ' ' + 'tags:' + h + ' ' + 'acct:' + i);
  ajax({
    method: 'POST',
    url: 'https://www.buxfer.com/api/add_transaction?token=' + apikey + '&format=sms&text=' + f + ' ' + g + ' ' + 'tags:' + h + ' ' + 'acct:' + i,
    type: 'json'
  },
       function(data) {
         console.log("Successful Buxfer data push!");
         console.log('transactionAdded: ' + data.response.transactionAdded);
         console.log('parseStatus: ' + data.response.parseStatus);
         console.log('status: ' + data.response.status);
         console.log('request_id: ' + data.response.request_id);
         cardExito = new UI.Card();
         cardExito.title('Añadido');
         console.log('request_id: ' + f);
         cardExito.subtitle(i);
         cardExito.body(f);
         cardExito.show();
         setTimeout(function() {
           getBudget(selectedCat);
         }, 2000);
       },
       function(error) {
         console.log('Falló inscripción API:' + JSON.stringify(error));
         console.log('type: ' + error.error.type);
         console.log('message: ' + error.error.message);
       }
      );
}

function getBudget(k) {
  //function getBudget(selected)
  ajax({
    method: 'POST',
    url: 'https://www.buxfer.com/api/budgets?token=' + apikey,
    type: 'json'
  },
       function(data) {
         console.log('Data Budget ' + JSON.stringify(data));
         selectedBudget = data.response.budgets.filter(function(obj) {
           return obj.name == k;
         });
         var selectedBugdetLenght = selectedBudget.length;
         console.log('Lenght SelectedBudget ' + selectedBugdetLenght);
         if (selectedBugdetLenght !== 0) {
           console.log('Data SelectedBudget ' + JSON.stringify(selectedBudget));
           var limitBudget = selectedBudget[0].limit;
           var spentBudget = selectedBudget[0].spent;
           var remainBudget = limitBudget - spentBudget;
           remainBudget = '$' + numberWithCommas(remainBudget);
           var cardBudget = new UI.Card();
           cardBudget.title('Presupuesto Restante');
           cardBudget.subtitle(k);
           cardBudget.body(remainBudget);
           cardBudget.show();
           setTimeout(function() {
             subcategoriasMenu.hide();
             categoriasMenu.hide();
             cardExito.hide();
             wind.hide();
             cardBudget.hide();
             wind.hide();
             wind.hide();
           }, 3000);
         }
         else {
           console.log('Transacción no pertenece a presupuesto');
           setTimeout(function() {
             cardExito.hide();
             subcategoriasMenu.hide();
             categoriasMenu.hide();
             wind.hide();          
           }, 3000); 
         }
       },

       function(error) {

       }
      );
}

function getCat(callback) {
  console.log('Iniciando funcion getCat');
  console.log(JSON.stringify(rawTrans));
  var descripcion1 = rawTrans.response.transactions[0].tags.split(',');
  console.log(rawTrans.response.transactions[0].description);
  console.log(descripcion1[0]);
  for (var i = 0; i < rawTrans.response.numTransactions; i++) {
    var cuenta = rawTrans.response.transactions[i].accountName;
    var categoria = rawTrans.response.transactions[i].tags.split(',');
    var descripcion = rawTrans.response.transactions[i].description;
    var monto = rawTrans.response.transactions[i].amount;
    var montocomma = numberWithCommas(monto);
    var CatUnica = Categorias1.indexOf(categoria[0]);
    var pointerCategoria = categoria[0];
    if (CatUnica == -1) {
      Categorias1.push(categoria[0]);
      itemsCategorias[pointerCategoria] = [];
      Categorias.push({
        title: categoria[0]
      });
      console.log(Categorias1);
    }
    itemsCategorias[pointerCategoria].push({
      title: descripcion,
      subtitle: "$" + montocomma,
      monto: monto,
      cuenta: cuenta
    });
  }  
  console.log(JSON.stringify(rawTrans));
  categoriasMenu = new UI.Menu({
    sections: [{
      title: 'Categorias',
      items: Categorias
    }]
  });
  cardLoading.hide();
  console.log("Probando menú " + JSON.stringify(Categorias));
  categoriasMenu.show();
  callback();

}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function clickCatMenu(callback) {
  categoriasMenu.on('select', function(f) {
    selectedCat = f.item.title;
    console.log('The item is titled "' + f.item.title + '"');

    itemsCategorias[selectedCat].push({
      title: 'Personalizado',
      subtitle: 'Personalizado',
      cuenta: 'Efectivo',
      monto: '5005'
    });

    subcategoriasMenu = new UI.Menu({
      sections: [{
        title: 'Gastos ' + selectedCat,
        items: itemsCategorias[selectedCat]
      }]
    });
    subcategoriasMenu.show();
    callback();
  });  
}

function clickSubcat(callback){
  subcategoriasMenu.on('select', function(e) {
    console.log('Subtitle item selectes is  "' + e.item.title + '"');
    transTitle = e.item.title;
    transSubTitle = e.item.subtitle;
    transMonto = e.item.monto;
    transCuenta = e.item.cuenta;
    var temp = transMonto.toString();
    var TransMontoLast = parseInt(temp[temp.length - 1]);
    console.log('Ultimo digito del numero ' + transMonto + '(' + temp + ')'+ ' es ' + TransMontoLast);

    if (e.item.title == 'Personalizado' || TransMontoLast == '5') {
      if (e.item.title == 'Personalizado') {
        transTitle = selectedCat + ' por clasificar';
        selectedCatPers = 'Personalizado,' + selectedCat;
      }
      else {
        selectedCatPers = selectedCat;  
      }
      if (TransMontoLast == '5') {
        var digits = (""+transMonto).split("");
        if (digits.length == 5) {
          num0.state.text = digits[0];
          num1.state.text = digits[1];
          num2.state.text = digits[2];
          num3.state.text = digits[3];
        }
        else if (digits.length == 4) {
          num1.state.text = digits[0];
          num2.state.text = digits[1];
          num3.state.text = digits[2];
        }
      }
      wind.show();
      callback();
    } 
    else {
      console.log('Trying to post"');
      postTrans(transTitle, transMonto, selectedCat, transCuenta);
    }
  });
}


function clickPerson(){
  numindex = 0;
  wind.on('click', 'select', function() {
    numindex++;
    if (numindex == 4) {
      //numindex = 0;
      transMonto = num0.state.text.toString() + num1.state.text.toString() + num2.state.text.toString() + num3.state.text.toString() + '0';
      transMonto = parseInt(transMonto);
      console.log(num0.state.text.toString() + num1.state.text.toString() + num2.state.text.toString() + num3.state.text.toString() + '0');
      console.log(transMonto);
      postTrans(transTitle, transMonto, selectedCatPers, transCuenta);
    }
    rect.state.position.x = numposx[numindex];

    wind.add(rect);
  });
  wind.on('click', 'up', function() {
    if (numindex != 3) {
      if (eval('num' + numindex + '.state.text') != '9')  {
        eval('num' + numindex + '.state.text++'); 
      }
      else {
        eval('num' + numindex + '.state.text = "0"'); 
      }
      eval('wind.add(num' + numindex +')');
    }
    else if (numindex == 3) {
      if (num3.state.text == '0') {
        num3.state.text = '5';  
      }
      else {
        num3.state.text = '0';
      }
      wind.add(num3);
    }
  });
  wind.on('click', 'down', function() {
    if (numindex != 3) {
      if (eval('num' + numindex + '.state.text') != '0')  {
        eval('num' + numindex + '.state.text--'); 
      }
      else {
        eval('num' + numindex + '.state.text = "9"'); 
      }
      eval('wind.add(num' + numindex +')');
    }
    else if (numindex == 3) {
      if (num3.state.text == '0') {
        num3.state.text = '5';  
      }
      else {
        num3.state.text = '0';
      }
      wind.add(num3);
    }
  });
}
