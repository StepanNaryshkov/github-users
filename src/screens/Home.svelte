<script>
  import { onMount } from 'svelte';
	import { username } from '../store/profile';
	import { film } from '../store/film';
	import { error } from '../store/app';
	import { getFilm } from '../api'

  onMount(() => getFilm('b'))
    let _filmName = '';
    function handleSubmit() {
      getFilm(_filmName);
    }
</script>

<style>
  div {
    max-width: 1200px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
	}
  :global(body) {
    background-color: #f5f5f5;
  }
  img {
    border-radius: 50%;
    margin-right: 20px;
  }
  .film {
    background: #FFF;
    box-shadow: 10px 10px 10px 0 rgba(86,91,119,.04);
    padding: 25px;
    border-radius: 9px;
    cursor: pointer;
  }

  .film__title {
    margin-top: 0;
    margin-bottom: 0;
  }

  .film__header {
    display: flex;
    align-items: center;
  }
</style>
<!--<button on:click={() => profile.set(defaultValues)}>EXIT</button>-->

<div>
  <h1>Hello {$username}</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="filmName" class="label">Please type a name of the film which you want to show</label>
    <input bind:value={_filmName} id="filmName">
    <input type="submit" value="Submit" class="btn">
  </form>
    {#if $film.Title}
        <article class="film">
          <header class="film__header">
            <img src={$film.Poster} alt={$film.Title} height="80" width="80">
            <h2 class="film__title">{$film.Title}</h2>
          </header>
          <div>
            <p>{$film.Plot}</p>
            <span>{$film.Actors}</span>
            <span>{$film.Language}</span>
            <span>{$film.Production}</span>
            <span>{$film.Released}</span>
          </div>
        </article>
    {/if}
  <span>{$error}</span>
</div>
