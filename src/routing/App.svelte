<script>
    import { Router, Route, Protected, Redirect } from 'swheel';
    import Home from '../screens/Home.svelte';
    import Main from '../screens/Main.svelte';
    import { username } from '../store/profile';
</script>


<Router>
  <Protected when={$username}>
    <Route path="/home" >
      <Home />
    </Route>
    <Redirect to='/home' />
  </Protected>

  <Protected when={!$username}>
    <Route path="/"  exact={true}>
      <Main />
    </Route>
    <Redirect to="/" />
  </Protected>
</Router>
