'use strict';

(function() {
  angular.module('ncsaas')
    .service('invitationService', ['baseServiceClass', '$http', 'ENV', invitationService]);

  function invitationService(baseServiceClass, $http, ENV) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/user-invitations/';
      },
      accept: function(invitation_uuid) {
        return this.executeAction(invitation_uuid, 'accept');
      },
      cancel: function(invitation_uuid) {
        return this.executeAction(invitation_uuid, 'cancel');
      },
      resend: function(invitation_uuid) {
        return this.executeAction(invitation_uuid, 'send');
      },
      executeAction: function(invitation_uuid, action) {
        var url = ENV.apiEndpoint + '/api/user-invitations/' + invitation_uuid + '/' + action + '/';
        return $http.post(url);
      }
    });
    return new ServiceClass();
  }

})();