import customerDetails from './CustomerDetails';
import customerManage from './customer-manage';
import customerPolicies from './customer-policies';
import customerReportError from './customer-report-error';
import customerThreshold from './customer-threshold';

export default module => {
  module.component('customerDetails', customerDetails);
  module.component('customerManage', customerManage);
  module.component('customerPolicies', customerPolicies);
  module.component('customerReportError', customerReportError);
  module.component('customerThreshold', customerThreshold);
};
