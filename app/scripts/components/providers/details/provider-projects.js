import template from './provider-projects.html';

export default function providerProjects() {
  return {
    restrict: 'E',
    scope: {
      service: '=provider'
    },
    controller: ProviderProjectsController,
    template: template
  };
}

// @ngInject
function ProviderProjectsController(
  $q,
  $scope,
  joinServiceProjectLinkService,
  projectsService,
  currentStateService,
  customersService,
  quotasService) {
  angular.extend($scope, {
    init: function() {
      $scope.loading = true;
      $scope.getChoices().then(function(choices) {
        $scope.choices = choices;
      }).finally(function() {
        $scope.loading = false;
      });

      $scope.quotaNames = ['ram', 'vcpu', 'storage'];
    },
    getChoices: function() {
      var vm = this;
      return customersService.isOwnerOrStaff().then(function(canManage) {
        vm.canManage = canManage;
        if (!vm.canManage) {
          return;
        }
        return vm.getContext().then(function(context) {
          var link_for_project = {};
          angular.forEach(context.links, function(link) {
            link_for_project[link.project_uuid] = link;
          });
          return context.projects.map(function(project) {
            var link = link_for_project[project.uuid];
            return vm.newChoice(project, link);
          });
        });
      });

    },
    newChoice: function(project, link) {
      let choice = {
        title: project.name,
        selected: link && !!link.url,
        link_url: link && link.url,
        project_url: project.url,
        subtitle: link && link.state,
        quotas: {},
        dirty: false,
      };

      $scope.quotaNames.forEach(function(name) {
          choice.quotas[name] = {
            limit: -1,
            name: name,
          };

          if (link && link.quotas && link.quotas.length > 1) {
            choice.quotas[name] = link.quotas.find(function(quota){return quota.name == name});
          }
      });

      return choice;
    },
    getContext: function() {
      // Context consists of list of projects and list of links
      return currentStateService.getCustomer().then(customer => {
        var context = {};
        return $q.all([
          this.getProjects(customer).then(projects => context.projects = projects),
          this.getLinks(customer).then(links => context.links = links)
        ]).then(() => context);
      });
    },
    getProjects: function(customer) {
      return projectsService.getList({
        customer: customer.uuid
      });
    },
    getLinks: function(customer) {
      // Get service project links filtered by customer and service
      return joinServiceProjectLinkService.getServiceProjectLinks(
        customer.uuid, $scope.service.service_type, $scope.service.uuid
      );
    },
    save: function() {
      var add_promises = this.choices.filter(function(choice) {
        return choice.selected && !choice.link_url;
      }).map(function(choice) {
        choice.subtitle = gettext('Adding link');
        return joinServiceProjectLinkService.addLink(
          $scope.service.service_type,
          $scope.service.uuid,
          choice.project_url).then(function(link) {
            choice.link_url = link.url;
            choice.subtitle = gettext('Link created');

            if (link.quotas && link.quotas.length > 0) {
              let updatePromises = link.quotas.map(function(quota) {
                choice.quotas[quota.name].url = quota.url;
                return quotasService.update(choice.quotas[quota.name]);
              });

              $q.all(updatePromises).catch(function(response){
                var reason = '';
                if (response.data && response.data.detail) {
                  reason = response.data.detail;
                }
                choice.subtitle = gettext('Unable to set quotas.') + ' ' + reason;
              });
            }
          }).catch(function(response) {
            var reason = '';
            if (response.data && response.data.detail) {
              reason = response.data.detail;
            }
            choice.subtitle = gettext('Unable to create link.') + ' ' + reason;
            choice.selected = false;
          });
      });

      let quotasUpdatePromises = $scope.choices.filter(function(choice){
        return choice.selected && choice.link_url && choice.dirty;
      }).map(function(choice){
        return $scope.quotaNames.map(function(name){
          return quotasService.update(choice.quotas[name]).then(function(){
              choice.dirty = false;
              choice.subtitle = gettext('Quotas have been updated.');
            }).catch(function(response){
                var reason = '';
                if (response.data && response.data.detail) {
                  reason = response.data.detail;
                }
                choice.subtitle = gettext('Unable to update quotas.') + ' ' + reason;
            });
          });
      });

      var delete_promises = this.choices.filter(function(choice) {
        return !choice.selected && choice.link_url;
      }).map(function(choice) {
        choice.subtitle = gettext('Removing link');
        return joinServiceProjectLinkService.$deleteByUrl(choice.link_url).then(function() {
          choice.link_url = null;
          choice.subtitle = gettext('Link removed');
        }).catch(function(response) {
          var reason = '';
          if (response.data && response.data.detail) {
            reason = response.data.detail;
          }
          choice.subtitle = gettext('Unable to delete link.') + ' ' + reason;
          choice.selected = true;
        });
      });

      return $q.all(add_promises.concat(delete_promises).concat(quotasUpdatePromises));
    }
  });
  $scope.init();
}
