import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';
import { canCreateOrganization } from '@waldur/workspace/selectors';

const CustomerCreateButton = ({ isVisible, onClick, translate }) => (
  isVisible ? (
    <ActionButton
      title={translate('Add organization')}
      action={onClick}
      icon={'fa fa-plus'}/>
  ) : null
);

const customerCreateDialog = () => openModalDialog('customerCreateDialog', {size: 'lg'});

const enhance = compose(
  withTranslation,
  connect(state => ({
    isVisible: canCreateOrganization(state),
  }), {
    onClick: customerCreateDialog,
  })
);

export default enhance(CustomerCreateButton);
