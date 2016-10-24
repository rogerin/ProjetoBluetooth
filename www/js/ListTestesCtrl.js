'use strict';
app.controller('ListTestesCtrl',function($scope,$cordovaSQLite) {
	$scope.testes = [];
	$scope.listarTestes = function() {
		var testes = [];
		var query = "SELECT * FROM testes";
		$cordovaSQLite.execute(db, query, []).then(function(res) {
			if(res.rows.length > 0) {
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
});
