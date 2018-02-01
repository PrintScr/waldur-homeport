import {
  CLEAR_DETAILS_POLLING_TASK, CLEAR_UNFOLDED_REQUESTS, REMOVE_UNFOLDED_REQUEST,
  SAVE_DETAILS_POLLING_TASK, SAVE_UNFOLDED_REQUEST, SAVE_WALDUR_PUBLIC_KEY, UNFOLDED_REQUEST_LOADED
} from '@waldur/ansible/python-management/actionNames';
import {PythonManagementDetailsState} from '@waldur/ansible/python-management/types/PythonManagementDetailsState';
import {PythonManagementDetailsPayload} from '@waldur/ansible/python-management/types/PythonManagementPayload';
import {Action} from '@waldur/issues/attachments/types';

const INITIAL_STATE: PythonManagementDetailsState = {
  detailsPollingTask: undefined,
  unfoldedRequests: [],
  waldurPublicKey: undefined,
};

export const reducer = (state: PythonManagementDetailsState = INITIAL_STATE, action: Action<PythonManagementDetailsPayload>): PythonManagementDetailsState => {
  const { type, payload } = action;
  switch (type) {
    case SAVE_WALDUR_PUBLIC_KEY:
      return {
        ...state,
        waldurPublicKey: payload.waldurPublicKey,
      };
    case SAVE_DETAILS_POLLING_TASK:
      return {
        ...state,
        detailsPollingTask: payload.detailsPollingTask,
      };
    case CLEAR_DETAILS_POLLING_TASK:
      return {
        ...state,
        detailsPollingTask: undefined,
      };
    case CLEAR_UNFOLDED_REQUESTS:
      return {
        ...state,
        unfoldedRequests: [],
      };
    case REMOVE_UNFOLDED_REQUEST:
      return {
        ...state,
        unfoldedRequests: state.unfoldedRequests.filter(unfoldedRequest => unfoldedRequest.requestUuid !== payload.requestUuid),
      };
    case SAVE_UNFOLDED_REQUEST:
      const unfoldedRequestsCopy = state.unfoldedRequests.slice();
      unfoldedRequestsCopy.push(payload.unfoldedRequest);
      return {
        ...state,
        unfoldedRequests: unfoldedRequestsCopy,
      };
    case UNFOLDED_REQUEST_LOADED:
      const index = state.unfoldedRequests.findIndex(unfoldedRequest => unfoldedRequest.requestUuid === payload.requestUuid);

      const unfoldedRequestCopy = {... state.unfoldedRequests[index]};
      unfoldedRequestCopy.loadingForFirstTime = false;

      const unfoldedRequestsArrayCopy = state.unfoldedRequests.slice();
      unfoldedRequestsArrayCopy[index] = unfoldedRequestCopy;
      return {
        ...state,
        unfoldedRequests: unfoldedRequestsArrayCopy,
      };
    default:
      return state;
  }
};
