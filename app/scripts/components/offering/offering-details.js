import template from './offering-details.html';
import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

const offeringDetails = {
  template,
  controller: class OfferingDetailsController {
    // @ngInject
    constructor(
      offeringsService,
      projectsService,
      customersService,
      currentStateService,
      WorkspaceService,
      BreadcrumbsService,
      $stateParams,
      $state) {
      this.offeringsService = offeringsService;
      this.projectsService = projectsService;
      this.customersService = customersService;
      this.currentStateService = currentStateService;
      this.WorkspaceService = WorkspaceService;
      this.BreadcrumbsService = BreadcrumbsService;
      this.$stateParams = $stateParams;
      this.$state = $state;
    }

    $onInit() {
      this.offeringsService.$get(this.$stateParams.uuid)
        .then(offering => {
          this.offering = offering;
          return this.projectsService.$get(offering.project_uuid).then(project => {
            this.currentStateService.setProject(project);
            return { project };
          });
        })
        .then(({ project }) => {
          return this.customersService.$get(project.customer_uuid).then(customer => {
            this.currentStateService.setCustomer(customer);
            return { customer, project };
          });
        }).then(({ customer, project }) => {
          this.WorkspaceService.setWorkspace({
            customer: customer,
            project: project,
            hasCustomer: true,
            workspace: WOKSPACE_NAMES.project,
          });
        })
        .then(() => this.refreshBreadcrumbs())
        .catch(() => {
          this.$state.go('errorPage.notFound');
        });
    }

    reInitResource(offering) {
      return this.offeringsService.$get(offering.uuid).then(response => {
        this.offering = response;
        this.refreshBreadcrumbs();
      });
    }

    refreshBreadcrumbs() {
      this.BreadcrumbsService.items = [
        {
          label: gettext('Project workspace'),
          state: 'project.details',
          params: {
            uuid: this.offering.project_uuid
          }
        },
        {
          label: gettext('Resources'),
        },
        {
          label: gettext('Requests'),
          state: 'project.resources.offerings',
          params: {
            uuid: this.offering.project_uuid
          }
        }
      ];
      this.BreadcrumbsService.activeItem = this.offering.name;
    }
  }
};

export default offeringDetails;
