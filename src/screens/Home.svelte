<script>
	import { onMount } from 'svelte';
	import { username, info, isFetching, error, password } from '../store/profile';
	import { getUsers } from '../api'
	onMount(() => getUsers($username))
</script>

<style>
	h1 {
		color: purple;
	}
</style>
<!--<button on:click={() => profile.set(defaultValues)}>EXIT</button>-->
<h1>Hello home {$info.bio}</h1>
<h3>Password: {$password}</h3>
<span>{$isFetching}</span>
<h2>{$error}</h2>
