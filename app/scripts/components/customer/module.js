import customerCreateModule from './create/module';
import customerDetailsModule from './details/module';
import customerPopoverModule from './popover/module';
import customerServicesModule from './services/module';
import customerWorkspaceModule from './workspace/module';
import customerList from './customer-list';
import routes from './routes';

export default module => {
  customerCreateModule(module);
  customerDetailsModule(module);
  customerPopoverModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
  module.component('customerList', customerList);
  module.config(routes);
};
