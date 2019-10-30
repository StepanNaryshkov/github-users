<script>
	import { username, password } from '../store/profile';
	let _username = '';
	let _password = '';

	function handleSubmit() {
        username.set(_username);
        password.set(_password);
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label for="username">User name
		<input type="text" id="username" required bind:value={_username}></label>
	<label for="password">Password<input type="password" id="password" required bind:value={_password}></label>
	<input type="submit" value="Log in">
</form>
