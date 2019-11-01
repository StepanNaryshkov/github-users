import { CNST_FILM } from './actionTypes';

export const filmInitialState = {
  film: null,
};

export function filmReducer(state, action) {
  console.log('action', action)
  switch (action.type) {
    case CNST_FILM.SET_FILM:
      return {
        ...state,
        film: {
          ...action.response
        }
      };
    default: return {
      ...state
    };
  }
}
