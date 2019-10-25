<script>
  import { Router, Link, Route } from "svelte-routing";
  import Main from "./screens/Main.svelte";
   import Home from "./screens/Home.svelte";
</script>

<Router>
  <Route path="/"><Main /></Route>
  <Route path="/home"><Home /></Route>
</Router>