import { put, call, takeLatest } from 'redux-saga/effects';
import { getSongs } from '@services/songApi';
import { homeContainerTypes, homeContainerCreators } from './reducer';

const { REQUEST_GET_ITUNES_SONGS } = homeContainerTypes;
// console.log("homeContainerTypes",homeContainerTypes);
const { successGetItunesSongs, failureGetItunesSongs } = homeContainerCreators;
export function* getItunesSongs(action) {
  const response = yield call(getSongs, action.artistName);
  const { data, ok } = response;
  if (ok) {
    yield put(successGetItunesSongs(data));
    console.log(data);
  } else {
    yield put(failureGetItunesSongs(data));
  }
}
// Individual exports for testing
export default function* homeContainerSaga() {
  yield takeLatest(REQUEST_GET_ITUNES_SONGS, getItunesSongs);
}
