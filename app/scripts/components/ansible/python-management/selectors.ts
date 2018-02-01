import {UnfoldedRequest} from '@waldur/ansible/python-management/types/UnfoldedRequest';

export const getDetailsPollingTask = (state): number => state.pythonManagementDetails.detailsPollingTask;
export const getUnfoldedRequests = (state): UnfoldedRequest[] => state.pythonManagementDetails.unfoldedRequests;
export const getWaldurPublicKey = (state): string => state.pythonManagementDetails.waldurPublicKey;
