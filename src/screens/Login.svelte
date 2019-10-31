<script>
	import { username } from '../store/profile';
	let _username = '';

	function handleSubmit() {
        username.set(_username);
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="form">
	<div class="icon">
		<svg class="svg" viewBox="0 0 24 24" width="24" height="24">
			<g fill="none">
				<path d="M0 0h24v24H0V0z"></path>
				<path d="M0 0h24v24H0V0z" opacity=".87"></path>
			</g>
			<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
		</svg>
	</div>
	<label for="username" class="label">User name</label>
	<input type="text" id="username" required bind:value={_username} class="input">
	<input type="submit" value="Sign in" class="btn">
</form>

<style>
	.form {
		max-width: 444px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-left: auto;
		margin-right: auto;
		margin-top: 10%;
	}
	.label {
		font-size: 1rem;
		font-family: "Roboto", "Helvetica", "Arial", sans-serif;
		font-weight: 400;
		line-height: 1.5;
		letter-spacing: 0.00938em;
		text-align: left;
		width: 100%;
	}
	.input {
		padding: 18px 14px;
		color: rgba(0, 0, 0, 0.87);
		line-height: 1.1875em;
		font-size: 1rem;
		width: 100%;
		height: 1.1875em;
		background: none;
		border-color: rgba(0, 0, 0, 0.23);
		border-style: solid;
		border-width: 1px;
		border-radius: 4px;
		margin-bottom: 25px;
	}
	.icon {
		color: #fff;
		background-color: rgb(220, 0, 78);
		width: 40px;
		height: 40px;
		display: flex;
		position: relative;
		font-size: 1.25rem;
		align-items: center;
		font-family: "Roboto", "Helvetica", "Arial", sans-serif;
		line-height: 1;
		user-select: none;
		border-radius: 50%;
		justify-content: center;
		margin-bottom: 15px;
	}
	.svg {
		fill: currentColor;
		display: inline-block;
		user-select: none;
	}
	.btn {
		color: #fff;
		background-color: #1976d2;
		box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
		padding: 6px 16px;
		font-size: 0.875rem;
		transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
		font-family: "Roboto", "Helvetica", "Arial", sans-serif;
		font-weight: 500;
		line-height: 1.75;
		border-radius: 4px;
		letter-spacing: 0.02857em;
		text-transform: uppercase;
		border: none;
		width: 100%;
		cursor: pointer;
	}
	.btn:hover {
		background-color: rgb(17, 82, 147);
	}
</style>
