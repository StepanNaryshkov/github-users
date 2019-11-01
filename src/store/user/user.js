import { CNST_USER } from './actionTypes';

export const userInitialState = {
  userName : '',
};

export function userReducer(state, action) {
  switch (action.type) {
    case CNST_USER.SET_USERNAME:
      return {
        ...state,
        userName: action.response
      };
    default: return {
      ...state
    };
  }
}
