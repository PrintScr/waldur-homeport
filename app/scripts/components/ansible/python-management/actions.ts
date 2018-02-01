import { createFormAction } from 'redux-form-saga';

import {
  CLEAR_DETAILS_POLLING_TASK, CLEAR_UNFOLDED_REQUESTS, REMOVE_UNFOLDED_REQUEST,
  SAVE_DETAILS_POLLING_TASK, SAVE_UNFOLDED_REQUEST, SAVE_WALDUR_PUBLIC_KEY, UNFOLDED_REQUEST_LOADED
} from '@waldur/ansible/python-management/actionNames';
import {PythonManagementDetailsPayload} from '@waldur/ansible/python-management/types/PythonManagementPayload';
import {UnfoldedRequest} from '@waldur/ansible/python-management/types/UnfoldedRequest';
import {Action} from '@waldur/issues/attachments/types';

export const createPythonManagement = createFormAction('waldur/pythonManagement/CREATE');
export const updatePythonManagement = createFormAction('waldur/pythonManagement/UPDATE');
export const deletePythonManagement = createFormAction('waldur/pythonManagement/DELETE');
export const findVirtualEnvironments = createFormAction('waldur/pythonManagement/FIND_VIRTUAL_ENVIRONMENTS');
export const findInstalledLibsInVirtualEnvironment = createFormAction('waldur/pythonManagement/FIND_LIBS_IN_ENVIRONMENT');
export const gotoApplicationsList = createFormAction('waldur/applications/GOTO_LIST');
export const goToInstanceDetails = createFormAction('waldur/instance/GOTO_DETAILS');

export const saveDetailsPollingTask = (detailsPollingTask: number): Action<PythonManagementDetailsPayload> => ({
  type: SAVE_DETAILS_POLLING_TASK,
  payload: {
    detailsPollingTask,
  },
});

export const clearDetailsPollingTask = (): Action<{}> => ({
  type: CLEAR_DETAILS_POLLING_TASK,
  payload: {},
});

export const clearUnfoldedRequests = (): Action<{}> => ({
  type: CLEAR_UNFOLDED_REQUESTS,
  payload: {},
});

export const removeUnfoldedRequest = (requestUuid: string): Action<PythonManagementDetailsPayload> => ({
  type: REMOVE_UNFOLDED_REQUEST,
  payload: {
    requestUuid,
  },
});

export const saveUnfoldedRequest = (unfoldedRequest: UnfoldedRequest): Action<PythonManagementDetailsPayload> => ({
  type: SAVE_UNFOLDED_REQUEST,
  payload: {
    unfoldedRequest,
  },
});

export const markUnfoldedRequestAsLoaded = (requestUuid: string): Action<PythonManagementDetailsPayload> => ({
  type: UNFOLDED_REQUEST_LOADED,
  payload: {
    requestUuid,
  },
});

export const saveWaldurPublicKey = (waldurPublicKey: string): Action<PythonManagementDetailsPayload> => ({
  type: SAVE_WALDUR_PUBLIC_KEY,
  payload: {
    waldurPublicKey,
  },
});
