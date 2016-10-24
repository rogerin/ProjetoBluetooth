var db = null;
var app = angular.module('limiar', ['ionic','limiar.controllers','ngCordova', 'ngRoute', 'timer'])

.filter('yTime', function() {
  return function(input) {
    
    var s = parseInt((input / 1000)  % 60);
    var m = parseInt((input / 60000) % 60);
    var h = parseInt(input / 3600000);
    //var mm= input.toString();

    var mm= input;

    if(mm.toString().length <= 3) {
      console.log("menor q 3");
    } else {
      mm = mm.toString().substr(-3);
    }

    return h+":"+m+":"+s+"."+mm;
  };
})
.run(function($ionicPlatform,$cordovaSQLite,$ionicPopup) {
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      //StatusBar.styleDefault();
      StatusBar.styleBlackTranslucent();

      
    }
      db = $cordovaSQLite.openDB({ name: "limiar.db", bgType: 1 });
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS alunos (id integer primary key, nome text, email text, nascimento text)");
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS testes(id integer primary key, aluno_id INTEGER, date string, FOREIGN KEY(aluno_id) REFERENCES alunos(id))");
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS dados(id integer primary key, testes_id INTEGER, date string, pressao text, co2 text, fc text, temp text, FOREIGN KEY(testes_id) REFERENCES testes(id))");

      //CURRENT_TIMESTAMP 
      window.plugins.insomnia.keepAwake();

    bluetoothSerial.isEnabled(
      function(){
        $ionicPopup.alert({
          title: 'Bluetooth Ativo!',
          template: 'Com o bluetooth ativo, podemos usar o <strong>Limiar APP</strong> sem nenhum problema.'
        });
      },
      function(){
        $ionicPopup.alert({
          title: 'Bluetooth Inativo!',
          template: 'Com o bluetooth <strong style=\"color: red;\">Inativo</strong>, o <strong>Limiar APP</strong> nao conseguirar executar as \"Avaliações\", habilite o bluetooth antes de continuar usando o <strong>Limiar APP</strong>.'
        });
      }
    );

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.aluno-cadastrar', {
      url: '/aluno/cadastrar',
      views: {
        'tab-dash': {
          templateUrl: 'templates/aluno/cadastrar-aluno.html',
          controller: 'AlunoCtrl'
        }
      }
    })
    .state('tab.aluno-listar', {
      url: '/aluno/listar',
      views: {
        'tab-dash': {
          templateUrl: 'templates/aluno/listar-aluno.html',
          controller: 'AlunoCtrl'
        }
      }
    })
    .state('tab.aluno-testes', {
      url: '/aluno/testes',
      views: {
        'tab-dash': {
          templateUrl: 'templates/aluno/testes.html',
          controller: 'ListTestesCtrl'
        }
      }
    })

    .state('tab.aluno-detalhes', {
      url: '/aluno/:idaluno',
      views: {
        'tab-dash': {
          templateUrl: 'templates/aluno/detalhes-aluno.html',
          controller: 'AlunoDetalheCtrl'
        }
      }
    })
    .state('tab.aluno-teste', {
      url: '/aluno/teste/:idteste',
      views: {
        'tab-dash': {
          templateUrl: 'templates/aluno/teste-aluno.html',
          controller: 'TesteAlunoCtrl'
        }
      }
    })
    
    .state('iniciar-teste', {
      url: '/iniciar/:idaluno',
      templateUrl: 'templates/bluetooth/teste.html',
      controller: 'TesteCtrl'
    })
    

    .state('account', {
      url: '/account',
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
      
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
