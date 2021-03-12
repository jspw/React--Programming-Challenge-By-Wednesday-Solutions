/*
 *
 * HomeContainer reducer
 *
 */
import produce from 'immer';
import { createActions } from 'reduxsauce';
import get from 'lodash/get';

export const { Types: homeContainerTypes, Creators: homeContainerCreators } = createActions({
  requestGetItunesSongs: ['artistName'],
  successGetItunesSongs: ['data'],
  failureGetItunesSongs: ['error'],
  clearItunesSongs: []
});

export const initialState = { artistName: null, songsData: [], songsError: null };

/* eslint-disable default-case, no-param-reassign */
export const homeContainerReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case homeContainerTypes.REQUEST_GET_ITUNES_SONGS:
        draft.artistName = action.artistName;
        break;
      case homeContainerTypes.CLEAR_ITUNES_SONGS:
        return initialState;
      case homeContainerTypes.SUCCESS_GET_ITUNES_SONGS:
        draft.songsData = action.data;
        break;
      case homeContainerTypes.FAILURE_GET_ITUNES_SONGS:
        draft.reposError = get(action.error, 'message', 'something_went_wrong');
        break;
    }
  });

export default homeContainerReducer;
