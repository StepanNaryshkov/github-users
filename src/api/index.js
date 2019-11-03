import { useContext } from 'react';
import { fetching, hasFetched, setError } from './../store/app/actionCreators';
import { setFilm } from './../store/film/actionCreators';
import { FilmDispatch, AppDispatch } from '../routing/App'

const url = 'http://www.omdbapi.com/?apikey=c411534d&' // to generate a key please use http://www.omdbapi.com/

export default function getFilm() {
  const filmDispatch = useContext(FilmDispatch);
  const appDispatch = useContext(AppDispatch);
  const makeRequest = async (searchTerm) => {
    appDispatch(fetching());
    try {
      let response = await fetch(`${url}&t=${searchTerm}`, {
        method: 'GET',
      })
      let result = await response.json();
      if (response.status === 200 && !result.Error) {
        filmDispatch(setFilm(result))
      } else {
        appDispatch(setError(result.Error));
      }

      appDispatch(hasFetched());
    } catch (e) {
      appDispatch(setError(e.message));
    }
  };

  return [makeRequest];
};
