import {CNST_APP} from './actionTypes';

export const fetching = () => ({type: CNST_APP.IS_FETCHING});
export const hasFetched = () => ({type: CNST_APP.HAS_FETCHED});
export const setError = (response) => ({type: CNST_APP.SET_ERROR, response});
export const clearError = () => ({type: CNST_APP.CLEAR_ERROR});
