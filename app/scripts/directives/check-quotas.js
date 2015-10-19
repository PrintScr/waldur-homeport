'use strict';

(function() {
  angular.module('ncsaas')
    .directive('checkQuotas', ['currentStateService', '$state', '$rootScope', checkQuotas]);

  function checkQuotas(currentStateService, $state, $rootScope) {
    var directive = {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl: "views/directives/check-quotas.html",
      scope: {
        checkQuotas: '@',
        tooltipType: '@',
        sref: '@',
        classLink: '@'
      },
      controller: checkQuotasController,
      link: checkQuotasLink
    };

    /**
     * Link function
     * @param scope
     * @param element
     */
    function checkQuotasLink(scope, element) {
      refresh(scope, element);
      scope.$on('checkQuotas:refresh', function() {
        refresh(scope, element);
      });
    }

    /**
     * Update disable state for directive element
     * @param scope
     * @param element
     */
    function refresh(scope, element) {
      // checkQuotas - quota type: resource, project, service, user
      // tooltipType: listItems, emptyListItems, addUser
      var item = scope.checkQuotas,
        currentCustomerUuid = currentStateService.getCustomerUuid();

      scope.plansLink = 'organizations.plans({uuid:\'' + currentCustomerUuid+ '\'})';

      currentStateService.isQuotaExceeded(item).then(function(response) {

        var style = calculatePosition(element);

        scope.triangleBefore = style.triangleBefore;
        scope.triangleAfter = style.triangleAfter;
        scope.enable = response;
        scope.classes.disabled = scope.enable;
      });
    }

    /**
     * Calculate position style for tooltip
     * @param element
     * @returns {{triangleBefore: ({right: string}|*), triangleAfter: ({right: string}|*)}}
     */
    function calculatePosition(element) {
      var triangleBefore,
          triangleAfter;

      triangleAfter = triangleBefore = Math.floor(element[0].offsetWidth / 2) || 100;

      triangleBefore = {right: triangleBefore + 'px'};
      triangleAfter = {right: triangleAfter + 1 + 'px'};

      return {
          triangleBefore: triangleBefore,
          triangleAfter: triangleAfter
      };
    }

    checkQuotasController.$inject = ['$scope'];

    /**
     * Controller function
     * @param $scope
     */
    function checkQuotasController($scope) {
      $scope.showMessage = false;
      $scope.classes = {};

      var classes;
      if ($scope.classLink && (classes = $scope.classLink.split(' '))) {
        classes.forEach(function(i) {
          $scope.classes[i] = true;
        });
      }

      $scope.$on('checkQuotas:closeAll', function() {
        $scope.closeTooltip();
      });

      $scope.closeTooltip = function() {
        $scope.showMessage = false;
      };

      $scope.openTooltip = function() {
        $scope.showMessage = true;
      };

      $scope.handleAction = function(e) {
        if ($scope.enable) {
          $rootScope.$broadcast('checkQuotas:closeAll');
          $scope.openTooltip();
          e.preventDefault();
          e.stopPropagation();
        } else if ($scope.sref) {
          $state.go($scope.sref);
        }
      };

    }

    return directive;
  }
})();