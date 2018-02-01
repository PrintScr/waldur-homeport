import * as React from 'react';
import {translate} from '@waldur/i18n';
import {WrappedFieldArrayProps} from 'redux-form/lib/FieldArray';
import {Field, FieldArray} from 'redux-form';
import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {
  existsExecutingGlobalRequest,
  isVirtualEnvironmentNotEditable
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import {installedPackages} from '@waldur/ansible/python-management/form/InstalledPackagesForm';
import {validateVirtualEnvironmentDirectory} from '@waldur/ansible/python-management/utils';
import {FieldError} from '@waldur/form-react';

interface VirtualEnvironmentsFormProps {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: PythonManagementFormData;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
}

export const VirtualEnvironmentsForm = (props: VirtualEnvironmentsFormProps) => (
  <div className="form-group">
    <label className="control-label col-sm-3">{translate('Virtual environments')}</label>
    <div className="row form-group">
      <div className="col-sm-3">
        <button
          type="button"
          title={translate('Find installed virtual environments & libraries')}
          className="btn btn-default"
          disabled={!props.pythonManagement || !props.pythonManagement.uuid || existsExecutingGlobalRequest(props.pythonManagement)}
          onClick={() => props.findVirtualEnvironments(props.pythonManagement.uuid)}>
          {translate('Find installed virtual environments & libraries')}
        </button>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-3"/>
      <div className="col-sm-8">
        <FieldArray name="virtualEnvironments" component={VirtualEnvironment} {...props}/>
      </div>
    </div>
  </div>
);

interface VirtualEnvironmentProps extends WrappedFieldArrayProps<any> {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: PythonManagementFormData;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
}

class VirtualEnvironment extends React.Component<VirtualEnvironmentProps> {

  state = {
    expandedVirtualEnvironments: [],
  };

  collapseOrExpandVirtualEnv = (index: number) => {
    const expandedVirEnvsCopy = this.state.expandedVirtualEnvironments.slice();
    const position = expandedVirEnvsCopy.indexOf(index);
    if (position > -1) {
      expandedVirEnvsCopy.splice(position, 1);
    } else {
      expandedVirEnvsCopy.push(index);
    }
    this.setState({expandedVirtualEnvironments: expandedVirEnvsCopy});
  }

  isVirtualEnvExpanded = (index: number) => {
    return this.state.expandedVirtualEnvironments.indexOf(index) > -1;
  }

  addVirtualEnvironment = () => {
    const expandedVirEnvsCopy = this.state.expandedVirtualEnvironments.slice();
    expandedVirEnvsCopy.push(this.props.fields.length);
    this.props.fields.push({});
    this.setState({
      expandedVirtualEnvironments: expandedVirEnvsCopy,
    });
  }

  render() {
    return (
      <div>
        {this.props.fields.map((virtualEnvironment, index) => (
          <div key={`virEnv_${index}`}>
            <div className="form-group row">
              <hr/>
              <div className="col-xs-5">
                <Field
                  name={`${virtualEnvironment}.name`}
                  type="text"
                  placeholder={translate('Virtual environment name')}
                  required={true}
                  disabled={isVirtualEnvironmentNotEditable(this.props.pythonManagement, index)}
                  component={renderField}
                  validate={validateVirtualEnvironmentDirectory}
                />
              </div>

              <button
                type="button"
                title={translate('Remove virtual environment')}
                className="btn btn-default"
                disabled={isVirtualEnvironmentNotEditable(this.props.pythonManagement, index)}
                onClick={() => this.props.fields.remove(index)}>X
              </button>

              <button
                type="button"
                title={translate('Find missing installed libraries')}
                className="btn btn-default"
                disabled={!this.props.pythonManagement.uuid
                || !this.props.pythonManagement.virtualEnvironments[index].uuid
                || isVirtualEnvironmentNotEditable(this.props.pythonManagement, index)}
                onClick={() => this.props.findInstalledLibsInVirtualEnvironment(this.props.pythonManagement.uuid, this.props.pythonManagement.virtualEnvironments[index].name)}>
                {translate('Find missing installed libraries')}
              </button>

              {!this.props.pythonManagement.virtualEnvironments[index].uuid
              && this.props.pythonManagement.virtualEnvironments[index].name
                ?
                <span className="glyphicon glyphicon-warning-sign"
                      title="Virtual environment has not yet been saved."/> : null}

              <a className="collapse-link" style={{marginLeft: '10px'}} onClick={() => this.collapseOrExpandVirtualEnv(index)}>
                <i className={'fa ' + (this.isVirtualEnvExpanded(index) ? 'fa-chevron-down' : 'fa-chevron-up')}/>
              </a>
            </div>
            <div className={this.isVirtualEnvExpanded(index) ? null : 'collapse'}>
              <FieldArray name={`${virtualEnvironment}.installedLibraries`}
                          component={installedPackages}
                          props={{
                            virtualEnvironmentIndex: index,
                            reduxFormChange: this.props.reduxFormChange,
                            pythonManagement: this.props.pythonManagement,
                          }}
              />
            </div>
          </div>
        ))}
        <div className="form-group row">
          <div className="col-xs-6">
            <button type="button"
                    className="btn btn-default btn-add-option"
                    onClick={this.addVirtualEnvironment}
                    disabled={existsExecutingGlobalRequest(this.props.pythonManagement)}>
              {translate('Add virtual environment')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const renderField = props => (
  <>
    <input {...props.input}
           type={props.type}
           placeholder={props.placeholder}
           disabled={props.disabled}
           className="form-control"/>
    <FieldError error={props.meta.error}/>
  </>
);
