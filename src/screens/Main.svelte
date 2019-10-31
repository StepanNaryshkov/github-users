<script>
	import { username } from '../store/profile';
	let _username = '';

	function handleSubmit() {
        username.set(_username);
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label for="username">User name
		<input type="text" id="username" required bind:value={_username}></label>
	<input type="submit" value="Log in">
</form>
