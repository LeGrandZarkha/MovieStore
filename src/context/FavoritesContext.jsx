import { createContext, useState } from "react";
import { setFavoritesCache, getFavoritesCache } from "../utils/cache";

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(getFavoritesCache());

    /* add/remove/isFavorites functions here */

    function toggleFavorite(movie) {
        setFavorites(prev => {
            const updated = { ...prev };
            if (updated[movie.id]) {
                delete updated[movie.id];
            } else {
                updated[movie.id] = movie;
            }
            setFavoritesCache(updated)
            return updated
        })
    }

    function isFavorite(tmdb_id) {
        return favorites[tmdb_id] !== undefined
    }


    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}