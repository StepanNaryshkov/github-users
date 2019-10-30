import { writable } from 'svelte/store';

export const username = writable('');
export const password = writable('');
export const info = writable({});
export const isFetching = writable(false);
export const error = writable('');
