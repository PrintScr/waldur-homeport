import * as React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getFormValues, InjectedFormProps, reduxForm} from 'redux-form';

import * as actions from '@waldur/ansible/python-management/actions';
import {findWaldurPublicKey} from '@waldur/ansible/python-management/api';
import {PythonManagementCreateForm} from '@waldur/ansible/python-management/create/PythonManagementCreateForm';
import {getWaldurPublicKey} from '@waldur/ansible/python-management/selectors';
import {resourcesService} from '@waldur/ansible/python-management/services.js';
import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {LoadingSpinner} from '@waldur/core/LoadingSpinner';
import {ListConfiguration} from '@waldur/form-react/list-field/types';
import {translate, TranslateProps, withTranslation} from '@waldur/i18n';
import {connectAngularComponent} from '@waldur/store/connect';

import {getProject} from '@waldur/workspace/selectors';
import {Project} from '@waldur/workspace/types';

export interface PythonManagementCreateProps extends InjectedFormProps, TranslateProps {
  project: Project;
  waldurPublicKey: string;
  createPythonManagement: (pythonManagement: PythonManagementFormData) => Promise<void>;
  gotoApplicationsList: () => Promise<void>;
  pythonManagement: PythonManagementFormData;
  saveWaldurPublicKey: (waldurPublicKey: string) => void;
}

class PythonManagementCreateComponent extends React.Component<PythonManagementCreateProps> {
  state = {
    loaded: false,
    erred: false,
    instances: [],
    instanceListProperties: {
      columns: [
        {
          name: 'name',
          label: translate('Name'),
        },
        {
          name: 'imageName',
          label: translate('Image name'),
        },
        {
          name: 'cores',
          label: translate('vCPU'),
        },
        {
          name: 'ram',
          label: translate('RAM'),
        },
        {
          name: 'disk',
          label: translate('Storage'),
        },
        {
          name: 'state',
          label: translate('State'),
        },
      ],
      choices: [],
      attributeToShow: 'name',
    } as ListConfiguration,
  };

  componentDidMount() {
    const params = {
      project_uuid: this.props.project.uuid,
      resource_category: 'vms',
      field: ['name', 'image_name', 'ram', 'cores', 'disk', 'url', 'service_project_link', 'state'],
    };
    Promise.all([resourcesService.getList(params), findWaldurPublicKey()])
        .then(([instances, waldurPublicKeyPayload]) => {
          this.props.saveWaldurPublicKey((waldurPublicKeyPayload as any).data.waldur_public_key);
          this.setState({
              instances,
              loaded: true,
              erred: false,
              instanceListProperties: {...this.state.instanceListProperties, choices: instances},
          });
        })
      .catch(() => {
        this.setState({
          loaded: false,
          erred: true,
        });
      });
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
      <PythonManagementCreateForm
        {...this.props}
        instanceListProperties={this.state.instanceListProperties}/>
    );
  }
}

const mapStateToProps = state => ({
  project: getProject(state),
  waldurPublicKey: getWaldurPublicKey(state),
  pythonManagement: getFormValues('pythonManagementCreate')(state),
});

const mapDispatchToProps = dispatch => ({
  createPythonManagement: data => actions.createPythonManagement(data, dispatch),
  gotoApplicationsList: () => actions.gotoApplicationsList(null, dispatch),
  saveWaldurPublicKey: (waldurPublicKey: string): void => dispatch(actions.saveWaldurPublicKey(waldurPublicKey)),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: 'pythonManagementCreate'}),
);

const PythonManagementCreateContainer = enhance(PythonManagementCreateComponent);

export default connectAngularComponent(PythonManagementCreateContainer);
