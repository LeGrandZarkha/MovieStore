import { createContext, useState, useEffect } from "react";
import { getGenresCache, setGenresCache } from '../utils/cache'


export const GenresContext = createContext();

export function GenresProvider({ children }) {
    const [fetchGenresStatus, setFetchGenresStatus] = useState('')
    const [moviesGenre, setMoviesGenre] = useState([])

    useEffect(() => {
        getMoviesGenres()
    }, [])


    const getMoviesGenres = async () => {

        const cachedGenres = getGenresCache()

        if (cachedGenres !== null) {
            setMoviesGenre(cachedGenres)
            setFetchGenresStatus('success')
            return
        }

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + import.meta.env.VITE_TMDB_TOKEN
            }
        };

        try {
            setFetchGenresStatus('loading')
            const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`)
            }

            const result = await response.json()
            setMoviesGenre(result.genres)
            setFetchGenresStatus('success')
            setGenresCache(result.genres)
        } catch (error) {
            console.log(error)
            setFetchGenresStatus('error')
        }
    }

    return (
        <GenresContext.Provider value={{ fetchGenresStatus, moviesGenre }}>
            {children}
        </GenresContext.Provider>
    )
}

