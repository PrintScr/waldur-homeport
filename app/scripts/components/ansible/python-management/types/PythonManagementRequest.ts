import {Library} from '@waldur/ansible/python-management/types/Library';
import {PythonManagementRequestState} from '@waldur/ansible/python-management/types/PythonManagementRequestState';
import {PythonManagementRequestType} from '@waldur/ansible/python-management/types/PythonManagementRequestType';

const PYTHON_MANAGEMENT_REQUEST_TIMEOUT = 3600;

export class PythonManagementRequest {
  uuid: string;
  requestState: PythonManagementRequestState;
  requestType: PythonManagementRequestType;
  created: Date;
  output: string;
  virtualEnvironmentName: string;
  librariesToInstall: Library[];
  librariesToRemove: Library[];

  static isGlobalRequest(request: PythonManagementRequest): boolean {
    return !request.virtualEnvironmentName;
  }

  static isExecuting(request: PythonManagementRequest): boolean {
    const differenceInSeconds = ((new Date()).valueOf() - request.created.valueOf()) / 1000;
    return differenceInSeconds < PYTHON_MANAGEMENT_REQUEST_TIMEOUT
      && request.requestState !== PythonManagementRequestState.OK
      && request.requestState !== PythonManagementRequestState.ERRED;
  }
}
