'use strict';
app.controller('TesteCtrl', function($scope,$stateParams,$ionicLoading,$cordovaSQLite){
	//alert($stateParams.idaluno);
	$scope.conectado = false;
	$scope.nome_teste ;
	$scope.testeIniciado = false;
	$scope.meuMinuto = null;






	$ionicLoading.show({
		template: 'Listando bluetooth..'
	});

	bluetoothSerial.isEnabled(
	  function(){
              bluetoothSerial.list(
                  function(results) {
                  	$ionicLoading.hide();
                      //app.display(JSON.stringify(results));
                    $scope.devices = results;	
                       
                  },
                  function(error) {
                  	$ionicLoading.hide();
                      console.log(JSON.stringify(error));
                  }
              );
	  },
	  function(){
	    $ionicPopup.alert({
	      title: 'Bluetooth Inativo!',
	      template: 'Com o bluetooth <strong style=\"color: red;\">Inativo</strong>, o <strong>Limiar APP</strong> nao conseguirar executar as \"Avaliações\", habilite o bluetooth antes de continuar usando o <strong>Limiar APP</strong>.'
	    });
	  }
	);


	$scope.startTimer = function (){
		$scope.$broadcast('timer-start');
		$scope.timerRunning = true;
		$scope.testeIniciado = true;
		console.log('Iniciar!');

	};
	$scope.stopTimer = function (){
		$scope.$broadcast('timer-stop');
		$scope.timerRunning = false;
		$scope.testeIniciado = false;
		console.log('Apertei p parar!');

	};
	$scope.$on('timer-stopped', function (event, data){
		console.log('Timer Stopped - data = ', data);
	});

	$scope.$on('timer-tick', function (event, args) {
		$scope.timerConsole += $scope.timerType  + ' - event.name = '+ event.name + ', timeoutId = ' + args.timeoutId + ', millis = ' + args.millis +'\n';

		console.log($scope.timerConsole);
		$scope.meuMinuto = args.millis;


	});



    $scope.connect = function(id){
		$ionicLoading.show({
			template: 'Conectando...'
		});	
		var i = 0;
					
		bluetoothSerial.connect(
			id,  
			function(){
				$ionicLoading.hide();
				$ionicLoading.show({
					template: 'Buscando aluno ID: ' + $stateParams.idaluno + ''
				});	

				var aluno = {};
				var query = "SELECT * FROM alunos WHERE id = ? LIMIT 1";
				$cordovaSQLite.execute(db, query, [$stateParams.idaluno]).then(function(res) {
					if(res.rows.length > 0) {
						$scope.aluno = res.rows.item(0);
						$ionicLoading.hide();
					} else {
						$ionicLoading.hide();
						$state.go('tab.aluno-listar');
						alert("Erro ao buscar detalhes do usuario.");
						console.log("No results found");
						$scope.result = false;
					}
				}, function (err) {
					$ionicLoading.hide();
					$scope.error = true;
					$scope.error_message = res;
					alert(err);
				});

				$scope.conectado = true;



				var data = {
						labels: [],
						datasets: [
							{
								label: "PRESSAO",
								fillColor: "rgba(220,220,220,0.2)",
								strokeColor: "rgba(220,220,220,1)",
								pointColor: "rgba(220,220,220,1)",
								pointStrokeColor: "#fff",
								pointHighlightFill: "#fff",
								pointHighlightStroke: "rgba(220,220,220,1)",
								data: []
							},
							{
								label: "OUTRO",
								fillColor: "rgba(151,187,205,0.2)",
								strokeColor: "rgba(151,187,205,1)",
								pointColor: "rgba(151,187,205,1)",
								pointStrokeColor: "#fff",
								pointHighlightFill: "#fff",
								pointHighlightStroke: "rgba(151,187,205,1)",
								data: []
							}
						]
					};			
				var ctx = document.getElementById("myChart").getContext("2d");
				
				var myNewChart = new Chart(ctx).Line(data, {
					responsive: true,
					animation: false,
					bezierCurve : false,
					pointDot : false,
					datasetFill : false
				});

				var i = 0;
				bluetoothSerial.subscribe('\n', function (data) {
					//console.log(data);
					$scope.dados = JSON.parse(data);
												
					//alert($scope.dados);
					var date = new Date();
					myNewChart.addData([$scope.dados.t, $scope.dados.f,$scope.dados.p], "teste");
					myNewChart.update();
					if(i > 15) myNewChart.removeData();
					i++;
					//$scope.$apply();

					if($scope.testeIniciado) {

					}

				});

			},    
			function(){
				alert('erro');
				$ionicLoading.hide();
			}    
		);
    }

});