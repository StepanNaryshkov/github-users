<script>
  import { Router, Route, Protected, Redirect } from 'swheel'
  import Home from '../screens/Home.svelte'
  import Login from '../screens/Login.svelte'
  import Error from '../components/Error.svelte'
  import Spinner from '../components/Spinner.svelte'

  import { username } from '../store/profile'
  import { isFetching } from '../store/app'
</script>

<style>
  :global(body) {
    background-color: #f5f5f5;
    min-width: 320px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;
  }
</style>

<Router>
  <Protected when={$username}>
    <Route path="/home">
      <Home />
    </Route>
    <Redirect to="/home" />
  </Protected>
  <Protected when={!$username}>
    <Route path="/" exact={true}>
      <Login />
    </Route>
    <Redirect to="/" />
  </Protected>
  <Error />
  {#if $isFetching}
    <Spinner />
  {/if}
</Router>
