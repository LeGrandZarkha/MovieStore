import { useContext } from 'react';
import { FavoritesContext } from '../context/FavoritesContext';
import MovieCard from '../components/MovieCard'

export default function Favorites() {
    const { favorites } = useContext(FavoritesContext)

    console.log(Object.values(favorites))

    return (
        <div className='favorite-wrapper p-5'>
            <h1>Your favorite movies</h1>
            <div className="favorite-list flex flex-wrap gap-5 justify-center">
                {Object.values(favorites).map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    )
}