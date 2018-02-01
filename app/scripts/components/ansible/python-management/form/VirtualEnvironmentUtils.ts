import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';

export const isVirtualEnvironmentNotEditable = (pythonManagement: PythonManagementFormData, index: number): boolean => {
  const virtualEnvironment = pythonManagement.virtualEnvironments[index];
  if (virtualEnvironment) {
    const virtualEnvironmentName = virtualEnvironment.name;
    if (pythonManagement.requests) {
      return pythonManagement.requests.some((r: PythonManagementRequest) =>
        PythonManagementRequest.isExecuting(r) && (PythonManagementRequest.isGlobalRequest(r) || r.virtualEnvironmentName === virtualEnvironmentName));
    }
  }
  return false;
};

export const existsExecutingGlobalRequest = (pythonManagement: PythonManagementFormData): boolean => {
  if (pythonManagement && pythonManagement.requests) {
    return pythonManagement.requests.some(r =>
      PythonManagementRequest.isExecuting(r) && PythonManagementRequest.isGlobalRequest(r));
  }
  return false;
};
