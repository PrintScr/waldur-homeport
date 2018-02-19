import { APPSTORE_CATEGORY } from './constants';

// @ngInject
export default function ansibleRoutes($stateProvider) {
  $stateProvider
    .state('appstore.ansible', {
      url: 'applications/:category/',
      template: '<ansible-job-create/>',
      data: {
        category: APPSTORE_CATEGORY,
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources',
        feature: 'ansible'
      },
      resolve: {
        // @ngInject
        application: function (AnsiblePlaybooksService, $stateParams, $state) {
          return AnsiblePlaybooksService.get($stateParams.category).catch(response => {
            if (response.status === 404) {
              $state.go('errorPage.notFound');
            }
          });
        }
      }
    })

    .state('appstore.pythonManagement', {
      url: 'applications/',
      // template: '<python-management-create/>',
      template: '<python-management-create-container/>',
      data: {
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources',
        feature: 'pythonManagement'
      }
    })

    .state('project.resources.pythonManagement', {
      url: 'applications/',
      template: '<ui-view/>',
      abstract: true,
    })

    .state('project.resources.pythonManagement.details', {
      url: ':pythonManagementUuid/',
      template: '<python-management-details-container/>',
      data: {
        pageTitle: gettext('Python Management details'),
        pageClass: 'gray-bg',
        feature: 'pythonManagement',
      }
    })

    .state('project.resources.ansible', {
      url: 'applications/',
      template: '<ui-view/>',
      abstract: true,
    })

    .state('project.resources.ansible.list', {
      url: '',
      template: '<ansible-jobs-list/>',
      data: {
        pageTitle: gettext('Applications'),
        feature: 'ansible'
      }
    })

    .state('project.resources.ansible.details', {
      url: ':jobId/',
      template: '<ansible-job-details/>',
      data: {
        pageTitle: gettext('Application details'),
        pageClass: 'gray-bg',
        feature: 'ansible',
      }
    });
}
