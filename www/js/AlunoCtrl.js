'use strict';
app.controller('AlunoCtrl',function($scope,$cordovaSQLite,$ionicLoading,$routeParams,$state) {

	$scope.aluno  = {
		nome:  '',
		email: '',
		nascimento: ''
	};
	$scope.alunos = [];

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
		var query = "SELECT * FROM alunos";
		$cordovaSQLite.execute(db, query, []).then(function(res) {
			if(res.rows.length > 0) {
				for (var i=0; i < res.rows.length; i++){
					row = res.rows.item(i);
					alunos.push(row);
				}
				$scope.alunos = alunos;
			} else {
				console.log("No results found");
				$scope.result = false;
			}
		}, function (err) {
			$scope.error = true;
			$scope.error_message = res;
			alert(err);
		});
	};



});