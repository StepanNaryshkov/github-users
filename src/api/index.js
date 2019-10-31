import { info, isFetching, error } from '../store/profile';

export async function getUsers(username) {
  isFetching.set(true);
  try {
    let response = await fetch('https://api.github.com/users/' + username, {
      method: 'GET'
    });
    let profile = await response.json();

    if (response.status === 200) {
      info.set(profile);
    } else {
      error.set(e.statusText);
    }

    isFetching.set(false);
  } catch (e) {
    isFetching.set(false);
    error.set(e.message);
  }
}
