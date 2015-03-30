'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      UserListController
    ]);

  function UserListController($location, usersService, $rootScope) {
    var vm = this;

    vm.showgroup = false;
    vm.list = usersService.getRawUserList();
    vm.remove = remove;

    function remove(user) {
      var index = vm.list.indexOf(user);

      user.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'usersService',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController($stateParams, $rootScope, usersService) {
    var vm = this;

    vm.activeTab = 'resources';
    vm.user = usersService.getUser($stateParams.uuid);
    vm.update = update;

    function update() {
      vm.user.$update();
    }

  }

})();