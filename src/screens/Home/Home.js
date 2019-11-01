import React, { useState, useContext } from 'react';
import './index.css';
import { FilmContext } from '../../routing/App'
import getFilm from '../../api';

export const Home = () => {
  const [filmName, handleFilmNameField] = useState('');
  const { film } = useContext(FilmContext);
  const [state, makeRequest] = getFilm();
  const submit = e => {
    e.preventDefault();
    makeRequest(filmName);
  }

  return (
    <div className="home">
      <form className="home__form" onSubmit={submit}>
      <label htmlFor="filmName" className="home__label">
        Please, type a name of the film
      </label>
      <input
        onChange={e=> handleFilmNameField(e.target.value)}
        id="filmName"
        className="home__input"
        value={filmName}
      />
      <input type="submit" value="Submit" className="home__btn"/>
    </form>
      {film && (
        <article className="home__film">
          <header className="home__header">
            <img
              className="home__img"
              src={film.Poster}
              alt={film.Title}
              height="80"
              width="80"/>
            <h1 className="home__title">{film.Title}</h1>
          </header>
          <p>{film.Plot}</p>
          <table className="home__table">
            <tbody>
            {film.Actors && (
              <tr>
                <th className="home__th">Starring:</th>
                <td>{film.Actors}</td>
              </tr>
            )}
            {film.Production && (
              <tr>
                <th className="home__th">Production company:</th>
                <td>{film.Production}</td>
              </tr>
            )}
            {film.Released && (
              <tr>
                <th className="home__th">Release date:</th>
                <td>{film.Released}</td>
              </tr>
            )}
              </tbody>
              </table>
              </article>
      )}

        </div>
  )
}
