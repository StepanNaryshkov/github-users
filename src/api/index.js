import { film } from '../store/film'
import { error, isFetching } from '../store/app'

const url = 'http://www.omdbapi.com/?apikey=c411534d&' // to generate a key please use http://www.omdbapi.com/

export async function getFilm(searchTerm) {
  isFetching.set(true)
  try {
    let response = await fetch(`${url}&t=${searchTerm}`, {
      method: 'GET',
    })
    let result = await response.json()

    if (response.status === 200 && !result.Error) {
      film.set(result)
    } else {
      error.set(result.Error)
    }

    isFetching.set(false)
  } catch (e) {
    isFetching.set(false)
    error.set(e.message)
  }
}
