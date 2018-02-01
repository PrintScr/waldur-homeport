import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import {FormContainer} from '@waldur/form-react';
import {translate} from '@waldur/i18n';
import {PurePythonManagementStatesIndicator} from '@waldur/ansible/python-management/form/PythonManagementState';
import {PythonManagementDetailsProps} from '@waldur/ansible/python-management/details/PythonManagementDetailsContainer';
import {VirtualEnvironmentsForm} from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import {
  stateIndicatorBuilder,
  TYPE_READABLE_TEXT_MAPPING
} from '@waldur/ansible/python-management/form/StateIndicatorBuilder';
import {formatDateTime} from '@waldur/core/dateUtils';
import {LoadingSpinner} from '@waldur/core/LoadingSpinner';
import {ResourceStateIndicator} from '@waldur/resource/state/ResourceState';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';
import {UnfoldedRequest} from '@waldur/ansible/python-management/types/UnfoldedRequest';
import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {PythonManagementRequestType} from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import {existsExecutingGlobalRequest} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';

interface PythonManagementDetailsSummaryProps extends PythonManagementDetailsProps {
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => void;
  updateAndReloadPythonManagementDetails: (formData: PythonManagementFormData) => void;
  deleteAndReloadPythonManagementDetails: (formData: PythonManagementFormData) => void;
}

export const PythonManagementDetailsSummary = (props: PythonManagementDetailsSummaryProps) => {
  return (
    <div className="wrapper wrapper-content">
      <div className="ibox-content">
        <div className="row m-md">
          <div className="col-md-6">
            <div>
              <h2 className="no-margins">
                {translate('Python management details')}
              </h2>
            </div>
          </div>
        </div>
        <div className="ibox">
          <div className="ibox-content">
            <div className="row">
              <div className="dl-horizontal col-sm-6">

                <form
                  onSubmit={props.handleSubmit(props.updateAndReloadPythonManagementDetails)}
                  className="form-horizontal">
                  <FormContainer
                    submitting={props.submitting}
                    labelClass="col-sm-3"
                    controlClass="col-sm-8">
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('State')}</label>
                      <div className="same-padding-as-control-label">
                        <PurePythonManagementStatesIndicator requestsStates={props.pythonManagement.requestsStateTypePairs}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('Virtual environments root directory')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.virtualEnvironmentsDirectory}
                        <span className="glyphicon glyphicon-info-sign"
                              style={{marginLeft: '10px' }}
                              title={translate('Located in home directory of default system user.')}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('Instance')}</label>
                      <div className="same-padding-as-control-label">
                        <a onClick={() => props.goToInstanceDetails(props.pythonManagement.instance)}>
                          {props.pythonManagement.instance.name}
                        </a>
                      </div>
                    </div>

                    <VirtualEnvironmentsForm reduxFormChange={props.change}
                                             pythonManagement={props.pythonManagement}
                                             findVirtualEnvironments={props.findVirtualEnvironments}
                                             findInstalledLibsInVirtualEnvironment={props.findInstalledLibsInVirtualEnvironment}/>

                  </FormContainer>

                  <div className="form-group">
                    <div className="col-sm-offset-3 col-sm-7">
                      <button type="submit"
                              className="btn btn-btn-primary btn-xs"
                              disabled={props.submitting || existsExecutingGlobalRequest(props.pythonManagement)}>
                        <i className="fa fa-shopping-cart"/>
                        <span>{props.translate('Save virtual environments')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => props.deleteAndReloadPythonManagementDetails(props.pythonManagement)}
                        disabled={props.submitting || existsExecutingGlobalRequest(props.pythonManagement)}>
                        <i className="fa fa-trash"/>
                        <span>{translate('Delete python management & virtual environments')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="row">
              <dl className="dl-horizontal col-sm-12">
                <div className="panel-body">
                  <div className="tabs-container m-l-sm">
                    <Tabs defaultActiveKey={1} id={'tabs'}>
                      <Tab eventKey={1} title="Actions history">
                        <PythonManagementActionsHistory
                          pythonManagement={props.pythonManagement}
                          triggerRequestOutputPollingTask={props.triggerRequestOutputPollingTask}
                          unfoldedRequests={props.unfoldedRequests}/>
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PythonManagementDetailsActionsHistoryProps {
  pythonManagement: PythonManagementFormData;
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => void;
  unfoldedRequests: UnfoldedRequest[];
}

const PythonManagementActionsHistory = (props: PythonManagementDetailsActionsHistoryProps) => {
  return (
    <div className="dataTables_wrapper">
      <table className="table table-striped dataTable">
        <thead>
        <tr>
          <th>{translate('Request type')}</th>
          <th>{translate('State')}</th>
          <th>{translate('Virtual environment')}</th>
          <th>{translate('Created')}</th>
        </tr>
        </thead>
        <tbody>
        {props.pythonManagement.requests.map((request, index) => (
          <PythonManagementActionHistoryRow
            {...props}
            request={request}
            key={index}/>
        ))}
        </tbody>
      </table>
    </div>
  );
};

interface PythonManagementDetailsActionsHistoryRowProps {
  request: PythonManagementRequest;
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => void;
  unfoldedRequests: UnfoldedRequest[];
}

const PythonManagementActionHistoryRow = (props: PythonManagementDetailsActionsHistoryRowProps) => {
  return (
    <>
      <tr onClick={() => props.triggerRequestOutputPollingTask(props.request)}
          style={{cursor: 'pointer'}}>
        <td>{translate(TYPE_READABLE_TEXT_MAPPING[props.request.requestType])}</td>
        <td>
          <ResourceStateIndicator {...stateIndicatorBuilder.buildStateIndicator(props.request)}/>
        </td>
        <td>
          {props.request.virtualEnvironmentName ? props.request.virtualEnvironmentName : translate('Global request')}
        </td>
        <td>{formatDateTime(props.request.created)}</td>
      </tr>
      <RequestOutputRow
        request={props.request}
        unfoldedRequests={props.unfoldedRequests}/>
    </>
  );
};

interface RequestOutputRowProps {
  request: PythonManagementRequest;
  unfoldedRequests: UnfoldedRequest[];
}

class RequestOutputRow extends React.Component<RequestOutputRowProps> {

  state = {
    taskPosition: -1,
  };

  componentWillReceiveProps(nextProps: RequestOutputRowProps) {
    this.setState({
      taskPosition: this.findTaskPosition(nextProps.request, nextProps.unfoldedRequests),
    });
  }

  findTaskPosition = (request: PythonManagementRequest, unfoldedRequests: UnfoldedRequest[]) =>
    unfoldedRequests.findIndex(unfoldedRequest => unfoldedRequest.requestUuid === request.uuid)

  isOutputBeingLoadedForTheFirstTime = () => this.props.unfoldedRequests[this.state.taskPosition].loadingForFirstTime;

  render() {
    return (
      this.state.taskPosition !== -1 &&
      (
        <tr>
          <td>
            {this.props.request.requestType === PythonManagementRequestType.SYNCHRONIZATION ?
              <>
                {translate('Libraries to install')}:
                <ul>
                  {this.props.request.librariesToInstall.map((lib, index) => (
                    <li key={index}>{lib.name} == {lib.version}</li>
                  ))}
                </ul>
                {translate('Libraries to remove')}:
                <ul>
                  {this.props.request.librariesToRemove.map((lib, index) => (
                    <li key={index}>{lib.name} == {lib.version}</li>
                  ))}
                </ul>
              </> : null}
          </td>
          <td colSpan={3}>
            {this.isOutputBeingLoadedForTheFirstTime() ?
              (<LoadingSpinner/>)
              : (<pre className="pre-scrollable" style={{maxWidth: '1000px'}}>{this.props.request.output}</pre>)
            }
          </td>
        </tr>
      )
    );
  }
}
