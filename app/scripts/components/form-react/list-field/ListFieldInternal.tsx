import * as React from 'react';
import {openListFieldModal} from '@waldur/form-react/list-field/ListFieldUtils';
import {connect} from 'react-redux';
import {ListConfiguration} from '@waldur/form-react/list-field/types';
import {translate, TranslateProps} from '@waldur/i18n';
import {InjectedFormProps} from 'redux-form';

export interface InternalListFieldProps extends InjectedFormProps, TranslateProps {
  openModal(): void;
  onOptionSelected(selectedRow: any);
  selectedOption: any;
  configuration: ListConfiguration;
}

class PureInternalListFieldForm extends React.Component<InternalListFieldProps> {
  render() {
    return (
      <div>
        <div>
          <a onClick={this.props.openModal}>
            {this.props.selectedOption ? this.props.selectedOption[this.props.configuration.attributeToShow] : translate('Choose option')}
          </a>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openModal: (): void => dispatch(openListFieldModal(ownProps.configuration, ownProps.onOptionSelected)),
  };
};

export const InternalListField = connect(null, mapDispatchToProps)(PureInternalListFieldForm);
