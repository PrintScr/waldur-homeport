const projectEvents = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ProjectEventsController,
  controllerAs: 'ListController',
  bindings: {
    project: '<'
  }
};

export default projectEvents;

// @ngInject
function ProjectEventsController(baseEventListController) {
  let controllerScope = this;
  let EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getUserFilter: function() {
      return {
        name: 'feature',
        choices: [
          {
            title: gettext('Project events'),
            value: 'projects',
            chosen: true
          },
          {
            title: gettext('Resource events'),
            value: 'resources'
          }
        ]
      };
    },
    getFilter: function() {
      let filter = {
        scope: controllerScope.project.url
      };
      if (!this.hasChosenUserFilter()) {
        filter.feature = ['projects', 'resources'];
      }
      return filter;
    }
  });

  controllerScope.__proto__ = new EventController();
}
