import { useEffect, useRef, useState } from 'react'
import './App.css'

import MovieCard from './components/MovieCard'
import FilterMoviesForm from './components/FilterMoviesForm'

const initialFilters = {
  title: '',
  genres: [],
  rating: null,
  adult: false
}

function Discovery() {

  const [movies, setMovies] = useState([])

  const [filters, setFilters] = useState(initialFilters)

  const [fetchMoviesStatus, setFetchMoviesStatus] = useState('')

  const [fetchGenresStatus, setFetchGenresStatus] = useState('')

  const [totalPages, setTotalPages] = useState(null)

  const [moviesGenre, setMoviesGenre] = useState([])

  useEffect(() => {
    getMoviesGenres()
  }, [])

  const CACHE_KEY = 'moviesGenreCache'
  const weekInMs = 7 * 24 * 60 * 60 * 1000


  const setGenresCache = (genres) => {
    const payload = {
      data: genres,
      fetchedAt: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  }


  const getGenresCache = () => {

    const rawCache = localStorage.getItem(CACHE_KEY)

    if (rawCache === null) {
      return null
    }

    try {
      const parsedCache = JSON.parse(rawCache)
      const isExpired = Date.now() > parsedCache.fetchedAt + weekInMs

      if (!parsedCache.data || !parsedCache.fetchedAt) {
        return null
      }

      if (isExpired) {
        return null
      }

      return parsedCache.data
    } catch (error) {
      return null
    }
  }

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

  const getMovieGenresById = (genreIds) => {
    return (
      genreIds.map(element => moviesGenre.find(genre => genre?.id === element)?.name)
    )
  }


  function normalizeTitle(str) {
    return str.replace(/[^\w\s]/g, '').replace(/\s{2,}/g, ' ').trim()
  }

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedTitleValue = useDebounce(filters.title, 300)
  const debouncedRatingValue = useDebounce(filters.rating, 300)

  const filteredMovies = movies.filter(movie =>
    Object.keys(filters).every(key => {
      const filterValue = filters[key];

      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined ||
        filterValue.length === 0
      ) {
        return true;
      }

      if (key === "rating") {
        return movie.vote_average >= filterValue;
      } else if (key === "title") {
        return normalizeTitle(movie.original_title).toLowerCase().includes(normalizeTitle(debouncedTitleValue).toLowerCase())
      } else if (key === "genres") {
        return movie.genre_ids.some((id) => filterValue.includes(id))
      }

      return movie[key] === filterValue;
    })
  );

  const [page, setPage] = useState(1)
  const prevFiltersRef = useRef(filters)
  const lastPageFetchedRef = useRef()

  const fetchMovies = async (isNewSearch, pageToFetch, effectiveFilters) => {

    // Empêche les appels concurrents (ex: double clic rapide sur "Show more").
    if (fetchMoviesStatus === 'loading') { return }

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`
      }
    };

    const isSearchByTitle = effectiveFilters.title.trim() !== ''

    try {
      setFetchMoviesStatus('loading')

      let url

      if (isSearchByTitle) {
        // /search/movie n'accepte que query/language/page/include_adult :
        // genres et note sont appliqués en filtrage local (filteredMovies) sur ce résultat.
        const searchFragments = [
          'include_adult=false',
          '&language=en-US',
          `&page=${pageToFetch}`,
          `&query=${encodeURIComponent(effectiveFilters.title.trim().replace(/\s+/g, ' '))}`
        ]
        url = `https://api.themoviedb.org/3/search/movie?${searchFragments.join('')}`
      } else {
        const discoverFragments = [
          'include_adult=false',
          '&language=en-US',
          '&include_video=false',
          '&sort_by=popularity.desc',
          `&page=${pageToFetch}`,
          effectiveFilters.genres.length > 0 ? `&with_genres=${effectiveFilters.genres.join(',')}` : null,
          effectiveFilters.rating ? `&vote_average.gte=${effectiveFilters.rating}` : null
        ]
        // Seuls les fragments actifs sont conservés dans la query string.
        url = `https://api.themoviedb.org/3/discover/movie?${discoverFragments.filter(fragment => fragment !== null).join('')}`
      }

      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const result = await response.json()
      setTotalPages(result.total_pages)

      if (isNewSearch) {
        setMovies(result.results)
      } else {
        setMovies(prev => {
          // TMDB peut renvoyer un film déjà récupéré sur une page précédente ;
          // on déduplique par id avant d'accumuler.
          const nouveauxFilms = result.results.filter(movie =>
            !prev.some(existant => existant.id === movie.id)
          );
          return [...prev, ...nouveauxFilms];
        });
      }

      setFetchMoviesStatus('success')
    } catch (error) {
      console.log(error)
      setFetchMoviesStatus('error')
    }
  }

  const retryFetch = (isNewSearch, pageToFetch) => {
    const effectiveFilters = {
      title: debouncedTitleValue,
      genres: filters.genres,
      rating: debouncedRatingValue,
      adult: filters.adult
    }
    fetchMovies(isNewSearch, pageToFetch, effectiveFilters)
  }

  useEffect(() => {
    const effectiveFilters = {
      title: debouncedTitleValue,
      genres: filters.genres,
      rating: debouncedRatingValue,
      adult: filters.adult
    }

    const isNewSearch = Object.keys(effectiveFilters).some(key => {
      if (key === 'genres') {
        const current = effectiveFilters.genres
        const previous = prevFiltersRef.current.genres
        if (current.length !== previous.length) return true
        return [...current].sort().join(',') !== [...previous].sort().join(',')
      }
      return effectiveFilters[key] !== prevFiltersRef.current[key]
    })

    const pageToFetch = isNewSearch ? 1 : page
    const alreadyFetched = !isNewSearch && pageToFetch === lastPageFetchedRef.current

    if (!alreadyFetched) {
      fetchMovies(isNewSearch, pageToFetch, effectiveFilters)
      lastPageFetchedRef.current = pageToFetch
    }

    prevFiltersRef.current = effectiveFilters
    if (isNewSearch) setPage(1)
  }, [page, debouncedTitleValue, debouncedRatingValue, filters.genres, filters.adult])


  let content;

  if (movies.length === 0) {
    if (fetchMoviesStatus === 'loading') {
      content = <p className='text-center py-12 text-lg text-gray-500'>Loading movies...</p>;
    } else if (fetchMoviesStatus === 'error') {
      content = (
        <>
          <p className='text-center py-12 text-lg text-gray-500'>Oh no...</p>
          <button onClick={() => retryFetch(true, 1)}>Retry</button>
        </>
      );
    }
  } else {
    content = (
      <>
        {filteredMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} getMovieGenresById={getMovieGenresById} fetchGenresStatus={fetchGenresStatus} />
        ))}
      </>
    );
  }

  return (
    <div className='movie-store max-w-6xl mx-auto p-6 font-sans'>
      <h1 className='text-center text-3xl font-bold mb-6'>Welcome to the Movie Store !</h1>

      <FilterMoviesForm setFilters={setFilters} filters={filters} moviesGenre={moviesGenre} initialFilters={initialFilters} />

      <div className='flex flex-wrap justify-center gap-6 py-4 mb-6'>
        {content}
      </div>

      <div className='flex flex-col items-center gap-2 mt-4'>
        <button
          onClick={() => setPage(prevPage => prevPage + 1)}
          disabled={(totalPages !== null && page >= totalPages) || fetchMoviesStatus === 'loading'}
          className='px-6 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors'
        >
          Show more
        </button>
        {movies.length > 0 && fetchMoviesStatus === 'loading' && (
          <span className='text-sm text-gray-500'>Loading...</span>
        )}
        {movies.length > 0 && fetchMoviesStatus === 'error' && (
          <span className='flex items-center gap-2 text-sm text-red-600'>
            Error loading more films.
            <button onClick={() => retryFetch(false, page)} className='px-3 py-1 border border-red-600 rounded text-red-600 text-xs'>
              Retry
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

export default Discovery