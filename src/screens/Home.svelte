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
    padding-top: 25px;
  }
  .img {
    border-radius: 50%;
    margin-right: 20px;
  }
  .form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
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
    font-size: 15px;
    line-height: 30px;
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
    margin-left: 5px;
  }
  .label {
    margin-bottom: 5px;
    width: 100%;
  }
  .input {
    padding: 8px 14px;
    color: rgba(0, 0, 0, 0.87);
    line-height: 1.1875em;
    font-size: 1rem;
    border-color: rgba(0, 0, 0, 0.23);
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    margin-bottom: 25px;
  }
</style>

<div class="wrap">
  <form on:submit|preventDefault={handleSubmit} class="form">
    <label for="filmName" class="label">
      Please, type a name of the film
    </label>
    <input bind:value={_filmName} id="filmName" class="input" />
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
          {#if $film.Actors}
            <tr>
              <th class="th">Starring:</th>
              <td>{$film.Actors}</td>
            </tr>
          {/if}
          {#if $film.Production}
            <tr>
              <th class="th">Production company:</th>
              <td>{$film.Production}</td>
            </tr>
          {/if}
          {#if $film.Released}
            <tr>
              <th class="th">Release date:</th>
              <td>{$film.Released}</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </article>
  {/if}
</div>
