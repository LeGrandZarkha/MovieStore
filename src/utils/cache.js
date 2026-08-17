import { FAVORITES_CACHE_KEY, GENRES_CACHE_KEY, WEEK_IN_MS } from "../constants"

// GENRES CACHE

export const getGenresCache = () => {

    const rawCache = localStorage.getItem(GENRES_CACHE_KEY)

    if (rawCache === null) {
        return null
    }

    try {
        const parsedCache = JSON.parse(rawCache)
        const isExpired = Date.now() > parsedCache.fetchedAt + WEEK_IN_MS

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


export const setGenresCache = (genres) => {
    const payload = {
        data: genres,
        fetchedAt: Date.now()
    }
    localStorage.setItem(GENRES_CACHE_KEY, JSON.stringify(payload))
}

// FAVORITES CACHE

export const getFavoritesCache = () => {
    const rawCache = localStorage.getItem(FAVORITES_CACHE_KEY)

    if (rawCache === null) {
        return {}
    }

    try {
        return JSON.parse(rawCache)
    } catch (error) {
        return {}
    }
}

export const setFavoritesCache = (favorites) => {
    localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(favorites))
}