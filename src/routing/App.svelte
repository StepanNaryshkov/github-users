<script>
    import { Router, Route, Protected, Redirect } from 'swheel';
    import Home from '../screens/Home.svelte';
    import Login from '../screens/Login.svelte';
    import { username } from '../store/profile';
</script>


<Router>
<!--  <Protected when={$username}>-->
<!--    <Route path="/home" >-->
<!--      <Home />-->
<!--    </Route>-->
<!--    <Redirect to='/home' />-->
<!--  </Protected>-->
  <Route path="/home" >
    <Home />
  </Route>
  <Redirect to='/home' />
  <Protected when={!$username}>
    <Route path="/"  exact={true}>
      <Login />
    </Route>
    <Redirect to="/" />
  </Protected>
</Router>

<style>
  :global(body) {
    box-sizing: border-box;
  }
</style>
