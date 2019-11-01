import { CNST_APP} from './actionTypes';

export const appInitialState = {
  isFetching : false,
  error : '',
};

export function appReducer(state, action) {
  switch (action.type) {
    case CNST_APP.IS_FETCHING:
      return {
        ...state,
        isFetching: true
      };
    case CNST_APP.HAS_FETCHED:
      return {
        ...state,
        isFetching: true
      };
    case CNST_APP.SET_ERROR:
      return {
        ...state,
        error: action.response
      };
    case CNST_APP.CLEAR_ERROR:
      return {
        ...state,
        error: ''
      };
    default: return {
      ...state
    };
  }
}
