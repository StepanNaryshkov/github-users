<script>
	import { email } from '../store';
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello home!</h1>
<a href="/">root</a>
<button on:click={() => email.set('')}>clear email</button>
