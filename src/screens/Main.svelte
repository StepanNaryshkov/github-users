<script>
	import { email, password } from '../store';
	let _email = '';
	let _password = '';

	function handleSubmit() {
		email.set(_email);
		password.set(_password);
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<h2>{$email}</h2>
	<label for="email">Email
		<input type="email" id="email" required bind:value={_email}></label>
	<label for="password">Password<input type="password" id="password" required bind:value={_password}></label>
	<input type="submit" value="Log in">
</form>
