<script>
  import { film } from '../store/film'
  import { getFilm } from '../api'

  let _filmName = ''

  function handleSubmit() {
    getFilm(_filmName)
    _filmName = ''
  }
</script>

<style>
  .wrap {
    max-width: 1200px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .img {
    border-radius: 50%;
    margin-right: 20px;
  }
  .film {
    background: #fff;
    box-shadow: 10px 10px 10px 0 rgba(86, 91, 119, 0.04);
    padding: 25px;
    border-radius: 9px;
  }
  .title {
    margin-top: 0;
    margin-bottom: 0;
  }
  .header {
    display: flex;
    align-items: center;
  }
  .table {
    text-align: left;
  }
  .th {
    padding-right: 20px;
  }
  .btn {
    color: #fff;
    background-color: #1976d2;
    padding: 6px 16px;
    font-size: 0.875rem;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    font-weight: 500;
    line-height: 1.75;
    border-radius: 4px;
    letter-spacing: 0.02857em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
  }
</style>

<div class="wrap">
  <form on:submit|preventDefault={handleSubmit}>
    <label for="filmName" class="label">
      Please, type a name of the film
    </label>
    <input bind:value={_filmName} id="filmName" />
    <input type="submit" value="Submit" class="btn" />
  </form>
  {#if $film.Title}
    <article class="film">
      <header class="header">
        <img
          class="img"
          src={$film.Poster}
          alt={$film.Title}
          height="80"
          width="80" />
        <h2 class="title">{$film.Title}</h2>
      </header>
      <p>{$film.Plot}</p>
      <table class="table">
        <tbody>
          <tr>
            <th class="th">Starring:</th>
            <td>{$film.Actors}</td>
          </tr>
          <tr>
            <th class="th">Production company:</th>
            <td>{$film.Production}</td>
          </tr>
          <tr>
            <th class="th">Release date:</th>
            <td>{$film.Released}</td>
          </tr>
        </tbody>
      </table>
    </article>
  {/if}
</div>
