'use strict';
app.controller('AlunoDetalheCtrl', function($scope,$cordovaSQLite,$ionicLoading,$stateParams,$state) {
	$ionicLoading.show({
		template: 'Buscado detalhes do usuario.'
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
});