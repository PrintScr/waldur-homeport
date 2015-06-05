'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass', 'customerPermissionsService', 'usersService', 'servicesService',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass, customerPermissionsService, usersService, servicesService) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = servicesService;
        this._super();
        this.searchFieldName = 'name';
        this.canUserAddService();
      },
      canUserAddService: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          if (user.is_staff) {
            vm.canUserAddService = true;
          }
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canUserAddService = hasRole;
          });

        });
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('ServiceListController',
      ['baseServiceListController', ServiceListController]);

  function ServiceListController(baseServiceListController) {
    var controllerScope = this;
    var ServiceController = baseServiceListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceAddController', ['servicesService',
      'currentStateService', 'projectCloudMembershipsService', 'projectsService',
      'baseControllerAddClass', ServiceAddController]);

  function ServiceAddController(
    servicesService, currentStateService, projectCloudMembershipsService, projectsService, baseControllerAddClass) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = servicesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.activate.bind(this));
        this._super();
        this.listState = 'services.list';
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.instance.customer = customer.url;
        });
        /*jshint camelcase: false */
        if (vm.instance.auth_url || vm.instance.name) {
          if (confirm('Clean all fields?')) {
            vm.instance.auth_url = '';
            vm.instance.name = '';
          }
        }
      },
      afterSave: function() {
        var vm = this;
        projectsService.filterByCustomer = false;
        projectsService.getList().then(function(response) {
          for (var i = 0; response.length > i; i++) {
            projectCloudMembershipsService.addRow(response[i].url, vm.instance.url);
          }
        });
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceDetailUpdateController',
      ['baseControllerClass', 'servicesService', '$stateParams', '$state', ServiceDetailUpdateController]);

  function ServiceDetailUpdateController(baseControllerClass, servicesService, $stateParams, $state) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      service: null,
      activeTab: 'projects',

      init:function() {
        this._super();
        this.activate();
      },
      activate:function() {
        var vm = this;
        servicesService.$get($stateParams.uuid).then(function(response) {
          vm.service = response;
        });
      },
      remove:function() {
        if (confirm('Are you sure you want to delete service?')) {
          this.service.$delete(
            function() {
              $state.go('services.list');
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceProjectTabController', [
      '$stateParams',
      'servicesService',
      'baseControllerClass',
      'projectCloudMembershipsService',
      ServiceProjectTabController
    ]);

  function ServiceProjectTabController(
    $stateParams, servicesService, baseControllerClass, projectCloudMembershipsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      service: null,
      serviceProjects: [],

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        servicesService.$get($stateParams.uuid).then(function(response) {
          vm.service = response;
        });
        vm.getServiceProjects();
      },
      getServiceProjects: function() {
        var vm = this;
        projectCloudMembershipsService.getList({cloud: $stateParams.uuid}).then(function(response) {
          vm.serviceProjects = response;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
