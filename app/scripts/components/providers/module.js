import { getServiceIcon, getTypeDisplay } from './registry';
import providerState from './provider-state';
import providersList from './provider-list';
import providerCreate from './ProviderCreateContainer';
import providerSettings from './ProviderUpdateContainer';
import detailsModule from './details/module';
import providerIcon from './provider-icon';
import CategoriesService from './categories-service';
import providerRoutes from './routes';

export default module => {
  module.config(providerRoutes);
  module.component('providerState', providerState);
  module.component('providersList', providersList);
  module.component('providerCreate', providerCreate);
  module.component('providerIcon', providerIcon);
  module.service('ncServiceUtils', () => ({ getTypeDisplay, getServiceIcon }));
  module.component('providerSettings', providerSettings);
  module.service('CategoriesService', CategoriesService);
  detailsModule(module);
};
