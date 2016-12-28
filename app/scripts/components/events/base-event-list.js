// @ngInject
export default function baseEventListController(
  baseControllerListClass,
  eventsService,
  EventDialogsService,
  eventFormatter,
  $filter) {
  var ControllerListClass = baseControllerListClass.extend({
    init:function() {
      this.service = eventsService;
      this.tableOptions = {
        noDataText: 'No events yet',
        noMatchesText: 'No events found matching filter.',
        searchFieldName: 'search',

        columns: [
          {
            title: 'Message',
            className: 'all',
            render: function(row) {
              return eventFormatter.format(row);
            }
          },
          {
            title: 'Timestamp',
            className: 'all',
            render: function(row) {
              return $filter('dateTime')(row['@timestamp']);
            }
          },
        ],

        tableActions: [
          {
            name: '<i class="fa fa-question-circle"></i> Event types',
            callback: EventDialogsService.eventTypes.bind(EventDialogsService)
          }
        ],

        rowActions: [
          {
            name: 'Details',
            callback: EventDialogsService.eventDetails.bind(EventDialogsService)
          }
        ]
      };
      this._super();
    },
  });

  return ControllerListClass;
}