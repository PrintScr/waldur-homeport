import {SubmissionError} from 'redux-form';
import {call, put, select, takeEvery} from 'redux-saga/effects';

import {translate} from '@waldur/i18n';
import {showSuccess} from '@waldur/store/coreSaga';
import {getProject} from '@waldur/workspace/selectors';

import {
createPythonManagement, deletePythonManagement, findInstalledLibsInVirtualEnvironment, findVirtualEnvironments,
gotoApplicationsList, goToInstanceDetails,
updatePythonManagement
} from './actions';
import * as api from './api';

export function* handleCreatePythonManagement(action) {
  const successMessage = translate('Python environment has been created.');
  const errorMessage = translate('Python environment could not be created.');
  try {
    const project = yield select(getProject);
    const response = yield call(api.createPythonManagement, action.payload);
    const createdPythonManagement = response.data;
    yield call(api.gotoPythonManagementDetails, createdPythonManagement, project);
    yield put(createPythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
      name: 'Weird error occurred',
    });
    yield put(createPythonManagement.failure(formError));
  }
}

function* handleGotoApplicationsList() {
  const project = yield select(getProject);
  yield call(api.goToApplicationsList, project);
}

export function* handleUpdatePythonManagement(action) {
  const successMessage = translate('Virtual environments updates have been scheduled.');
  const errorMessage = translate('Virtual environments requests could not be created.');
  try {
    yield call(api.updatePythonManagement, action.payload);
    yield put(updatePythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(updatePythonManagement.failure(formError));
  }
}

export function* handleDeletePythonManagement(action) {
  const successMessage = translate('Virtual environments deletion has been scheduled.');
  const errorMessage = translate('Virtual environments deletion request could not be created.');
  try {
    yield call(api.deletePythonManagement, action.payload);
    yield put(deletePythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(deletePythonManagement.failure(formError));
  }
}

export function* handleGoToInstanceDetails(action) {
  yield call(api.goToInstanceDetails, action.payload);
}

export function* handleFindVirtualEnvironments(action) {
  const successMessage = translate('Virtual environments search has been scheduled.');
  const errorMessage = translate('Virtual environments search request could not be created.');
  try {
    yield call(api.findVirtualEnvironments, action.payload);
    yield put(findVirtualEnvironments.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(findVirtualEnvironments.failure(formError));
  }
}

export function* handleFindInstalledLibsInVirtualEnvironment(action) {
  const successMessage = translate('Search for installed libraries in the virtual environment has been scheduled.');
  const errorMessage = translate('Request for search for installed libraries in the virtual environments could not be created.');
  try {
    yield call(api.findInstalledLibsInVirtualEnvironment, action.payload);
    yield put(findInstalledLibsInVirtualEnvironment.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(findInstalledLibsInVirtualEnvironment.failure(formError));
  }
}

export default function* pythonManagementSaga() {
  yield takeEvery(createPythonManagement.REQUEST, handleCreatePythonManagement);
  yield takeEvery(gotoApplicationsList.REQUEST, handleGotoApplicationsList);
  yield takeEvery(updatePythonManagement.REQUEST, handleUpdatePythonManagement);
  yield takeEvery(goToInstanceDetails.REQUEST, handleGoToInstanceDetails);
  yield takeEvery(deletePythonManagement.REQUEST, handleDeletePythonManagement);
  yield takeEvery(findVirtualEnvironments.REQUEST, handleFindVirtualEnvironments);
  yield takeEvery(findInstalledLibsInVirtualEnvironment.REQUEST, handleFindInstalledLibsInVirtualEnvironment);
}
