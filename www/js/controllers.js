angular.module('limiar.controllers', [])

.controller('DashCtrl', function($scope) {})
.controller('TesteAlunoCtrl', function($scope,$ionicLoading,$ionicPopup,$stateParams,$cordovaSQLite) {

		
		$ionicLoading.show({
			template: 'Buscando Registros..'
		});	

		var registros = [];

		var query = "SELECT * FROM dados WHERE testes_id = ? ORDER BY id ASC";
		$cordovaSQLite.execute(db, query, [$stateParams.idteste]).then(function(res) {
			if(res.rows.length > 0) {
				for (var i=0; i < res.rows.length; i++){
					row = res.rows.item(i);
					registros.push(row);
				}
				$scope.registros = registros;
				$ionicLoading.hide();
			} else {
				$ionicPopup.alert({
					title: 'Nenhum registro encontrado!',
					template: 'Nao encontramos nenhum REGISTRO cadastrado neste teste no <strong>Limiar APP</strong>.'
				});
				$ionicLoading.hide();
				console.log("No results found");
				$scope.result = false;
			}
		}, function (err) {
			$scope.error = true;
			$scope.error_message = err;
			alert(err);
		});
	


})

.controller('AlunoCtrl', function($scope,$cordovaSQLite,$ionicLoading,$routeParams,$state,$ionicPopup) {

	$scope.aluno  = {
		nome:  '',
		email: '',
		nascimento: ''
	};
	

	$scope.cadastrarAluno = function(){
		$ionicLoading.show({
			template: 'Cadastrando...'
		});
		var query = "INSERT INTO alunos (nome, email, nascimento) VALUES (?,?,?)";
		$cordovaSQLite.execute(db, query, [$scope.aluno.nome, $scope.aluno.email, $scope.aluno.nascimento]).then(function(res){
			//$scope.aluno = res;
			$state.go('tab.aluno-listar');
			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			$scope.result = err;
			console.error(err);
			alert(err);
		});
	};

	$scope.listarAlunos = function(){
		var alunos = [];
		var query = "SELECT * FROM alunos ORDER BY nome";
		$cordovaSQLite.execute(db, query, []).then(function(res) {
			if(res.rows.length > 0) {
				for (var i=0; i < res.rows.length; i++){
					row = res.rows.item(i);
					alunos.push(row);
				}
				$scope.alunos = alunos;
			} else {
				$ionicPopup.alert({
					title: 'Nenhum aluno encontrado!',
					template: 'Nao encontramos nenhum ALUNO cadastrado no <strong>Limiar APP</strong>.'
				});
				$ionicLoading.hide();
				console.log("No results found");
				$scope.result = false;
			}
		}, function (err) {
			$scope.error = true;
			$scope.error_message = err;
			alert(err);
		});
	};



})
.controller('AlunoDetalheCtrl', function($scope,$cordovaSQLite,$ionicLoading,$ionicPopup,$stateParams,$state) {
	$ionicLoading.show({
		template: 'Buscado detalhes do usuario.'
	});

	var aluno = {};
	var query = "SELECT * FROM alunos WHERE id = ? LIMIT 1";
	$cordovaSQLite.execute(db, query, [$stateParams.idaluno]).then(function(res) {
		if(res.rows.length > 0) {
			$scope.aluno = res.rows.item(0);
			$ionicLoading.hide();
			
			$ionicLoading.show({
				template: 'Buscado Testes.'
			});

			$scope.testes = [];
			
				var testes = [];
				var query = "SELECT * FROM testes WHERE aluno_id = ? ORDER BY id DESC";
				$cordovaSQLite.execute(db, query, [$scope.aluno.id]).then(function(res) {
					if(res.rows.length > 0) {
						console.log(res);
					
						for (var i=0; i < res.rows.length; i++){
							row = res.rows.item(i);
							testes.push(row);
						}
						$scope.testes = testes;
						$ionicLoading.hide();
					} else {
						$ionicPopup.alert({
							title: 'Nenhum teste encontrado!',
							template: 'Nao encontramos nenhum teste cadastrado no <strong>Limiar APP</strong>.'
						});
						$ionicLoading.hide();
						$scope.result = false;
					}
				}, function (err) {
					$ionicLoading.hide();
						$ionicPopup.alert({
							title: 'Erro!',
							template: err
						});
					$scope.error = true;
					$scope.error_message = res;
					alert(err);
				});

			


	
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
		//$scope.error_message = res;
		alert(err);
	});


})
.controller('ListTestesCtrl', function($scope,$cordovaSQLite,$ionicPopup) {
	$scope.testes = [];
	$scope.listarTestes = function() {
		var testes = [];
		//  SELECT * FROM alunos AS A JOIN testes AS T ON A.id=T.aluno_id;
		var query = "SELECT * FROM alunos AS A JOIN testes AS T ON A.id=T.aluno_id ORDER BY T.id DESC";
		$cordovaSQLite.execute(db, query, []).then(function(res) {
			
			if(res.rows.length > 0) {
				console.log(res);
				for (var i=0; i < res.rows.length; i++){
					row = res.rows.item(i);
					testes.push(row);
				}
				$scope.testes = testes;
			} else {
				$ionicPopup.alert({
					title: 'Nenhum teste encontrado!',
					template: 'Nao encontramos nenhum teste cadastrado no <strong>Limiar APP</strong>.'
				});
				$scope.result = false;
			}
		}, function (err) {
				$ionicPopup.alert({
					title: 'Erro!',
					template: err
				});
			$scope.error = true;
			$scope.error_message = res;
			alert(err);
		});

	}
})

.controller('TesteCtrl', function($scope,$stateParams,$ionicLoading,$cordovaSQLite,$ionicPopup,$state){
	$scope.aluno = {};
	$scope.conectado = false;
	$scope.nome_teste ;
	
	$scope.criaTeste = false;
	
	$scope.testeIniciado = false;
	$scope.meuMinuto = null;

	$scope.testeId = null;



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
	        label: "TEMP",
	        fillColor: "rgba(151,187,205,0.2)",
	        strokeColor: "rgba(151,187,205,1)",
	        pointColor: "rgba(151,187,205,1)",
	        pointStrokeColor: "#fff",
	        pointHighlightFill: "#fff",
	        pointHighlightStroke: "rgba(151,187,205,1)",
	        data: []
	    },
	    {
	        label: "FC",
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

		document.getElementById("legendDiv").innerHTML = myNewChart.generateLegend();

	$scope.stopTeste = function() {
		bluetoothSerial.disconnect(
			function(){
				alert('Teste finalizado.');
				$scope.criaTeste = false;
				$scope.testeId = null;
				
				$state.go('tab.dash');
			}, 
			function(){
				alert('Erro, tente novamente..');
			}
		);
	}

	


	$scope.insereDados = function(testes_id, pressao, co2, fc, temp) {
		var query = "INSERT INTO dados (testes_id, date,pressao, co2, fc, temp) VALUES (?,?,?,?,?,?)";
		//var data = new Date().getTime();
		$cordovaSQLite.execute(db, query, [testes_id, $scope.meuMinuto,pressao, co2, fc, temp]).then(function(res) {
			//console.log("insertId: " + res.insertId);
		}, function (err) {
			console.error(err);
			alert(err);
		});
	}

	$scope.pausarTeste = function() {
		
		$scope.testeIniciado = false;
		$scope.$broadcast('timer-stop');
		$scope.timerRunning = false;;
		console.log('Apertei p parar!');
	}
	$scope.playTeste = function() {
		
		$scope.testeIniciado = true;
		$scope.$broadcast('timer-resume');
		$scope.timerRunning = true;
		console.log('Iniciar!');

	}



	$scope.criarTeste = function() {
		
		var query = "INSERT INTO testes (aluno_id,date) VALUES (?,?)";
		var data = new Date().getTime();
		$cordovaSQLite.execute(db, query, [$scope.aluno.id,data]).then(function(res) {
			console.log("insertId: " + res.insertId);
			$scope.testeId = res.insertId;
			$scope.criaTeste = true;
			$scope.$broadcast('timer-start');
			$scope.timerRunning = true;
			$scope.testeIniciado = true;
		}, function (err) {
			console.error(err);
		});
	}

	
	$scope.$on('timer-stopped', function (event, data){
		console.log('Timer Stopped - data = ', data);
	});

	$scope.$on('timer-tick', function (event, args) {
		$scope.timerConsole += $scope.timerType  + ' - event.name = '+ event.name + ', timeoutId = ' + args.timeoutId + ', millis = ' + args.millis +'\n';
		$scope.meuMinuto = args.millis;
	});


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


	



    $scope.connect = function(id){
		$ionicLoading.show({
			template: 'Conectando...'
		});	
	
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
						

						var i = 0;
						bluetoothSerial.subscribe('\n', function (data) {
							$scope.$apply(function(){
								$scope.dados = JSON.parse(data);
								//var date = new Date(); , date.getMinutes().toString()+":"+date.getSeconds().toString()+"."+date.getMilliseconds().toString()
								myNewChart.addData([$scope.dados.p,$scope.dados.t,$scope.dados.f]);
								//myNewChart.update();
								
								if($scope.testeIniciado) {
									$scope.insereDados($scope.testeId, $scope.dados.p, 0, $scope.dados.f, $scope.dados.t) 
								}

								if(i > 15) {
									myNewChart.removeData();
								}
								i++;
							});


						});



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
				$scope.painel 	 = true;
				//$state.go('iniciar-teste-aluno', {idaluno: $stateParams.idaluno}); 

			},    
			function(){
				alert('erro');
				$ionicLoading.hide();
			}    
		);
    }

    $scope.iniciarTeste = function(){
    	//$scope.nome_teste = new Date().getTime().toString();
    	alert($stateParams.idaluno);
    	alert($scope.nome_teste);

    }
});
