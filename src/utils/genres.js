import { getGenresCache } from './cache';

export const getMovieGenresById = (genreIds) => {
    const moviesGenre = getGenresCache(); // lu directement, à chaque appel
    return genreIds.map(id => moviesGenre.find(genre => genre?.id === id)?.name);
}