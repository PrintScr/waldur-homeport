'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePortal',
    toBeFeatures: [
      'localSignup',
      'localSignin',
      'password',
      'team',
      'people',
      'payment',
      'compare',
      'monitoring',
      'backups',
      'templates',
      'sizing',
      'projectGroups',
      'apps',
      'private_clouds',
      'premiumSupport'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        icon: 'desktop',
        services: ['Amazon', 'DigitalOcean', 'OpenStack']
      }
    ],
    serviceCategories: [
      {
        name: 'Virtual machines',
        services: ['Amazon', 'DigitalOcean', 'OpenStack'],
      }
    ],
    futureCategories: [
      {
        name: 'Private clouds',
        icon: 'cloud'
      },
      {
        name: 'Applications',
        icon: 'database'
      },
      {
        name: 'Support',
        icon: 'wrench'
      }
    ]
  });