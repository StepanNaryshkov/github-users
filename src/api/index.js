import { useReducer, useContext } from 'react';
import { appReducer, appInitialState } from './../store/app/app';
import { fetching, hasFetched, setError } from './../store/app/actionCreators';
import { setFilm } from './../store/film/actionCreators';
import { FilmDispatch } from '../routing/App'
const url = 'http://www.omdbapi.com/?apikey=c411534d&' // to generate a key please use http://www.omdbapi.com/

export default function getFilm() {
  const [state, dispatch] = useReducer(appReducer, appInitialState);
  const filmDispatch = useContext(FilmDispatch);
  const makeRequest = async (searchTerm) => {
    dispatch(fetching());
    try {
      let response = await fetch(`${url}&t=${searchTerm}`, {
        method: 'GET',
      })
      let result = await response.json();
      if (response.status === 200 && !result.Error) {
        filmDispatch(setFilm(result))
      } else {
        dispatch(setError(result.Error));
      }

      dispatch(hasFetched());
    } catch (e) {
      dispatch(setError(e.message));
    }
  };

  return [state, makeRequest];
};
