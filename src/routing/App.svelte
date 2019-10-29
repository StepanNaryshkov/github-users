<script>
    import { Router, Route, Protected, Redirect } from 'swheel';
    import Home from '../screens/Home.svelte';
    import Main from '../screens/Main.svelte';
    import { email } from '../store';
</script>


<Router>
  <Protected when={$email}>
    <Route path="/home" >
      <Home />
    </Route>
    <Redirect to='/home' />
  </Protected>

  <Protected when={!$email}>
    <Route path="/"  exact={true}>
      <Main />
    </Route>
    <Redirect to="/" />
  </Protected>
</Router>
