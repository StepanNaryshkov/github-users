import { writable } from 'svelte/store';

export const isFetching = writable(false);
export const error = writable('');
