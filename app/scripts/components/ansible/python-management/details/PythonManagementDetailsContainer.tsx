import * as React from 'react';

import {connect} from 'react-redux';
import {compose} from 'redux';
import {getFormValues, initialize, InjectedFormProps, reduxForm} from 'redux-form';

import {LoadingSpinner} from '@waldur/core/LoadingSpinner';
import {TranslateProps, withTranslation} from '@waldur/i18n/index';
import {connectAngularComponent} from '@waldur/store/connect';
import {getProject} from '@waldur/workspace/selectors';

import * as actions from '../actions';
import {resourcesService} from '../services.js';
import {loadPythonManagement, loadPythonManagementRequest} from '../api';
import {PythonManagementDetailsSummary} from '@waldur/ansible/python-management/details/PythonManagementDetailsSummary';
import {$state} from '@waldur/core/services';
import {
  buildPythonManagementCreateFormData,
  buildPythonManagementRequestFull,
  buildPythonManagementRequestsFull
} from '@waldur/ansible/python-management/mappers';
import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {Instance} from '@waldur/ansible/python-management/types/Instance';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';
import {UnfoldedRequest} from '@waldur/ansible/python-management/types/UnfoldedRequest';
import {InstalledLibrariesSearchDs} from '@waldur/ansible/python-management/types/InstalledLibrariesSearchDs';
import {
  isVirtualEnvironmentNotEditable
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import {VirtualEnvironment} from '@waldur/ansible/python-management/types/VirtualEnvironment';
import {getDetailsPollingTask, getUnfoldedRequests} from '@waldur/ansible/python-management/selectors';

const REQUEST_OUTPUT_POLLING_INTERVAL = 20 * 1000;

export interface PythonManagementDetailsProps extends InjectedFormProps, TranslateProps {
  project: any;
  detailsPollingTask: number;
  unfoldedRequests: UnfoldedRequest[];
  goToInstanceDetails: (instance: Instance) => void;
  initializePythonManagementDetailsForm: (formData) => Promise<void>;
  pythonManagement: PythonManagementFormData;
  updatePythonEnvironment: (pythonManagement: PythonManagementFormData) => Promise<void>;
  deletePythonEnvironment: (pythonManagement: PythonManagementFormData) => Promise<void>;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
  clearDetailsPollingTask: () => void;
  saveDetailsPollingTask: (detailsPollingTask: number) => void;
  clearUnfoldedRequests: () => void;
  removeUnfoldedRequest: (requestUuid: string) => void;
  saveUnfoldedRequest: (unfoldedRequest: UnfoldedRequest) => void;
  markUnfoldedRequestAsLoaded: (requestUuid: string) => void;
}

interface PythonManagementDetailsState {
  loaded: boolean;
  erred: boolean;
}

class PythonManagementDetailsComponent extends React.Component<PythonManagementDetailsProps, PythonManagementDetailsState> {
  state: PythonManagementDetailsState = {
    loaded: false,
    erred: false,
  };

  componentDidMount() {
    const pythonManagementUuid = $state.params.pythonManagementUuid;
    Promise.resolve(loadPythonManagement(pythonManagementUuid))
      .then((pythonManagement: any) =>
        Promise.all([
          Promise.resolve(pythonManagement),
          resourcesService.$get(
            null,
            null,
            pythonManagement.python_management.instance,
            {field: ['name', 'image_name', 'ram', 'cores', 'disk', 'url']})]))
      .then(([pythonManagement, instance]) => {
        const pythonManagementCasted = pythonManagement as any;
        this.props.initializePythonManagementDetailsForm(buildPythonManagementCreateFormData(pythonManagementCasted, instance));
        this.triggerDetailsPollingTask(pythonManagementUuid);
      })
      .then(() =>
        this.setState({
          loaded: true,
          erred: false,
        }))
      .catch(() => {
        this.setState({
          loaded: false,
          erred: true,
        });
      });
  }

  componentWillUnmount() {
    this.props.unfoldedRequests.forEach((taskDs: UnfoldedRequest) => clearTimeout(taskDs.task));
    this.props.clearUnfoldedRequests();
    clearTimeout(this.props.detailsPollingTask);
    this.props.clearDetailsPollingTask();
  }

  updateAndReloadPythonManagementDetails = (formData: PythonManagementFormData) => {
    this.props.updatePythonEnvironment(formData).then(() => this.reloadPythonManagementDetails(this.props.pythonManagement.uuid));
  }

  deleteAndReloadPythonManagementDetails = (formData: PythonManagementFormData) => {
    this.props.deletePythonEnvironment(formData).then(() => this.reloadPythonManagementDetails(this.props.pythonManagement.uuid));
  }

  triggerDetailsPollingTask = (pythonManagementUuid: string) => {
    this.props.saveDetailsPollingTask(
      window.setInterval(() => this.reloadPythonManagementDetails(pythonManagementUuid), REQUEST_OUTPUT_POLLING_INTERVAL));
  }

  reloadPythonManagementDetails = (pythonManagementUuid: string) => {
    loadPythonManagement(pythonManagementUuid)
      .then( updatedPythonManagement => {
        this.mergeVirtualEnvironments(updatedPythonManagement);
        this.mergeRequests(updatedPythonManagement);
      });
  }

  mergeRequests = (updatedPythonManagement: any) => {
    const updatedRequests = buildPythonManagementRequestsFull(updatedPythonManagement.requests as any[]);
    const currentRequestsCopy = this.props.pythonManagement.requests.slice();
    const newRequestsList = [];
    updatedRequests.forEach(updatedRequest => {
      const correspondingExistingRequest = this.findRequestByUuid(currentRequestsCopy, updatedRequest.uuid);
      if (correspondingExistingRequest && this.isRequestOpened(correspondingExistingRequest.uuid)) {
        updatedRequest.output = correspondingExistingRequest.output;
        if (this.hasRequestFinishedExecution(updatedRequest) && this.hasRequestBeenPulling(correspondingExistingRequest)) {
          this.stopPollingTaskForTheRequest(correspondingExistingRequest.uuid);
          this.ensureRequestHasLatestOutput(correspondingExistingRequest.uuid);
        }
      }
      newRequestsList.push(updatedRequest);
    });
    this.props.change('requests', newRequestsList);
  }

  findRequestByUuid = (requests: PythonManagementRequest[], requestUuid: string) => {
    return requests.find(r => r.uuid === requestUuid);
  }

  hasRequestBeenPulling = (request: PythonManagementRequest) => {
    return PythonManagementRequest.isExecuting(request);
  }

  ensureRequestHasLatestOutput = (requestUuid: string) => {
    loadPythonManagementRequest(this.props.pythonManagement.uuid, requestUuid)
      .then((requestWithOutput: any) =>
        this.props.change('requests', this.copyAndUpdateRequests(requestUuid, requestWithOutput)));
  }

  hasRequestFinishedExecution = (updatedRequest: PythonManagementRequest) => {
    return !PythonManagementRequest.isExecuting(updatedRequest);
  }

  stopPollingTaskForTheRequest = (requestUuid: string) => {
    const taskIndex = this.props.unfoldedRequests
      .findIndex((taskDs: UnfoldedRequest) => taskDs.requestUuid === requestUuid);
    clearTimeout(this.props.unfoldedRequests[taskIndex].task);
  }

  isRequestOpened = (requestUuid: string) => {
    return this.props.unfoldedRequests.some(r => r.requestUuid === requestUuid);
  }

  mergeVirtualEnvironments = (updatedPythonManagementPayload: any) => {
    const virtualEnvironmentsFormCopy = this.props.pythonManagement.virtualEnvironments.slice();
    const updatedPythonManagement = buildPythonManagementCreateFormData(updatedPythonManagementPayload, null);
    this.removeDeletedVirtualEnvironments(virtualEnvironmentsFormCopy, updatedPythonManagement);
    updatedPythonManagement.virtualEnvironments.forEach((virtualEnv, virtualEnvIndex) => {
      const virtualEnvNotEditable = isVirtualEnvironmentNotEditable(this.props.pythonManagement, virtualEnvIndex);
      if (virtualEnvNotEditable) {
        virtualEnvironmentsFormCopy[virtualEnvIndex] = virtualEnv;
      }
    });
    this.props.change('virtualEnvironments', virtualEnvironmentsFormCopy);
  }

  removeDeletedVirtualEnvironments = (virtualEnvironmentsFormCopy: VirtualEnvironment[], updatedPythonManagement: PythonManagementFormData) => {
    for (let i = virtualEnvironmentsFormCopy.length - 1; i >= 0; i--) {
      const virtualEnvironment = virtualEnvironmentsFormCopy[i];
      if (virtualEnvironment.uuid && !this.existsVirtualEnvironment(updatedPythonManagement, virtualEnvironment.name)) {
        virtualEnvironmentsFormCopy.splice(i, 1);
      }
    }
  }

  existsVirtualEnvironment = (updatedPythonManagement: PythonManagementFormData, name: string) => {
    return updatedPythonManagement.virtualEnvironments.some((virtualEnvironment => virtualEnvironment.name === name));
  }

  triggerRequestOutputPollingTask = (request: PythonManagementRequest) => {
    const requestUnfolded = this.props.unfoldedRequests.some((taskDs: UnfoldedRequest) => taskDs.requestUuid === request.uuid);
    if (requestUnfolded) {
      const requestIndex = this.props.unfoldedRequests.findIndex(taskDs => taskDs.requestUuid === request.uuid);
      clearInterval(this.props.unfoldedRequests[requestIndex].task);
      this.props.removeUnfoldedRequest(request.uuid);
    } else {
      this.props.saveUnfoldedRequest(this.buildUnfoldedRequest(request, !PythonManagementRequest.isExecuting(request)));
    }
  }

  buildUnfoldedRequest = (request: PythonManagementRequest, runOnce: boolean): UnfoldedRequest => {
    const unfoldedRequest = new UnfoldedRequest();
    unfoldedRequest.requestUuid = request.uuid;
    unfoldedRequest.loadingForFirstTime = true;
    this.loadPythonManagementRequestAndSetState(request.uuid);
    if (!runOnce) {
      unfoldedRequest.task = window.setInterval(() => this.loadPythonManagementRequestAndSetState(request.uuid), REQUEST_OUTPUT_POLLING_INTERVAL);
    }
    return unfoldedRequest;
  }

  loadPythonManagementRequestAndSetState = (requestUuid: string) => {
    loadPythonManagementRequest(this.props.pythonManagement.uuid, requestUuid)
      .then((requestWithOutput: any) => {
        this.copyAndUpdateRequests(requestUuid, requestWithOutput);
        this.props.markUnfoldedRequestAsLoaded(requestUuid);
      });
  }

  copyAndUpdateRequests = (requestUuid: string, requestWithOutput: any): void => {
    const updatedRequestsCopy = this.props.pythonManagement.requests.slice();
    const requestIndex = updatedRequestsCopy.findIndex(request => request.uuid === requestUuid);
    updatedRequestsCopy[requestIndex] = buildPythonManagementRequestFull(requestWithOutput[0]);
    this.props.change('requests', updatedRequestsCopy);
  }

  render() {
    if (this.state.erred) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load python management details.')}
        </h3>
      );
    }
    if (!this.state.loaded) {
      return <LoadingSpinner/>;
    }
    return (
      <PythonManagementDetailsSummary
        {...this.props}
        triggerRequestOutputPollingTask={this.triggerRequestOutputPollingTask}
        updateAndReloadPythonManagementDetails={this.updateAndReloadPythonManagementDetails}
        deleteAndReloadPythonManagementDetails={this.deleteAndReloadPythonManagementDetails}/>
    );
  }
}

const mapStateToProps = state => ({
  project: getProject(state),
  pythonManagement: getFormValues('pythonManagementDetails')(state),
  detailsPollingTask: getDetailsPollingTask(state),
  unfoldedRequests: getUnfoldedRequests(state),
});

const mapDispatchToProps = dispatch => ({
  createPythonManagement: data => actions.createPythonManagement(data, dispatch),
  gotoApplicationsList: () => actions.gotoApplicationsList(null, dispatch),
  goToInstanceDetails: (instance: Instance) => actions.goToInstanceDetails(instance.uuid, dispatch),
  initializePythonManagementDetailsForm: formData => dispatch(initialize('pythonManagementDetails', formData)),
  updatePythonEnvironment: (pythonManagement: PythonManagementFormData) => actions.updatePythonManagement(pythonManagement, dispatch),
  deletePythonEnvironment: (pythonManagement: PythonManagementFormData) => actions.deletePythonManagement(pythonManagement, dispatch),
  findVirtualEnvironments: (pythonManagementUuid: string) => actions.findVirtualEnvironments(pythonManagementUuid, dispatch),
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) =>
    actions.findInstalledLibsInVirtualEnvironment(new InstalledLibrariesSearchDs(pythonManagementUuid, virtualEnvironmentName), dispatch),
  clearDetailsPollingTask: (): void => dispatch(actions.clearDetailsPollingTask()),
  saveDetailsPollingTask: (detailsPollingTask: number): void => dispatch(actions.saveDetailsPollingTask(detailsPollingTask)),
  clearUnfoldedRequests: (): void => dispatch(actions.clearUnfoldedRequests()),
  removeUnfoldedRequest: (requestUuid: string): void => dispatch(actions.removeUnfoldedRequest(requestUuid)),
  saveUnfoldedRequest: (unfoldedRequest: UnfoldedRequest): void => dispatch(actions.saveUnfoldedRequest(unfoldedRequest)),
  markUnfoldedRequestAsLoaded: (requestUuid: string): void => dispatch(actions.markUnfoldedRequestAsLoaded(requestUuid)),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: 'pythonManagementDetails'}),
);

// const PythonManagementCreateComponent = connect(
//   state => ({
//     selectedInstance: selector(state, 'listFieldSelection')
//   })
// )(PythonManagementCreateComponent);

const PythonManagementDetailsContainer = enhance(PythonManagementDetailsComponent);

export default connectAngularComponent(PythonManagementDetailsContainer);
