import authService from './auth-service';
import authLogin from './auth-login';
import authLoginComplete from './auth-login-complete';
import authInit from './auth-init';
import authActivation from './auth-activation';
import authRoutes from './routes';
import { initAuthToken, initAuthProvider } from './auth-config';
import interceptorModule from './interceptor';

export default module => {
  module.service('authService', authService);
  module.directive('authLogin', authLogin);
  module.directive('authLoginComplete', authLoginComplete);
  module.directive('authInit', authInit);
  module.directive('authActivation', authActivation);
  module.config(authRoutes);
  module.config(initAuthToken);
  module.config(initAuthProvider);
  interceptorModule(module);
};
