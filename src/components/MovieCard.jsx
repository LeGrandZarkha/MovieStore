import { FaStar } from 'react-icons/fa'
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../constants';
import { FavoritesContext } from '../context/FavoritesContext';
import { useContext } from 'react';
import { getMovieGenresById } from '../utils/genres';
import { GenresContext, GenresProvider } from '../context/GenresContext';

export default function MovieCard({ movie }) {

    const { isFavorite, toggleFavorite } = useContext(FavoritesContext)

    const { fetchGenresStatus } = useContext(GenresContext)

    const convertRatingToStars = (rating) => {
        const scale5Rating = rating / 2
        const integerPart = Math.floor(scale5Rating)
        const pourcentageEtoile = (scale5Rating - integerPart) * 100
        const displayRating = scale5Rating.toFixed(1)
        return { integer: integerPart, percentage: pourcentageEtoile, hasRating: (!isNaN(rating)), displayRating: displayRating }
    }

    const { integer, percentage, hasRating, displayRating } = convertRatingToStars(movie.vote_average)

    let genresContent

    if (fetchGenresStatus === 'loading') {
        genresContent = null
    } else if (fetchGenresStatus === 'error') {
        genresContent = '!'
    } else {
        if (movie.genre_ids.length === 0) {
            genresContent = null
        } else {
            genresContent = getMovieGenresById(movie.genre_ids).join(' - ')
        }
    }

    return (
        <div className="movie-card relative w-56 h-80 rounded-lg overflow-hidden shadow-md bg-gray-200 group">
            <div className="movie-thumbnail relative w-full h-full">
                <img src={`${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`} className='object-cover w-full h-full' alt={movie.title} />
            </div>
            <div className='card-wrapper absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity'>
                <div className='absolute inset-0 bg-black/70 z-0'></div>

                <div className='absolute right-6 top-6 opacity-100 w-5 h-5 z-15' onClick={() => toggleFavorite(movie)}>
                    {isFavorite(movie.id) ?
                        (<FaHeart className='text-red-500 w-full h-full' />)
                        :
                        (<FaRegHeart className='text-white w-full h-full' />)}
                </div>
                <div className="movie-infos absolute bottom-0 inset-x-0 text-white p-3">
                    <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none z-0" />
                    <header className='relative z-10'>
                        <h2 className='text-white font-semibold text-sm'>{movie.title}</h2>
                    </header>
                    <div className="relative movie-tags z-10">
                        <p className='text-xs opacity-80 mb-1'>{genresContent}</p>
                    </div>
                    <footer className='relative flex flex-col items-center gap-1 z-10'>
                        {hasRating ? (
                            <div className='flex'>
                                {[0, 1, 2, 3, 4].map(index => {
                                    let fillWidth = '0%'
                                    if (index < integer) fillWidth = '100%'
                                    else if (index === integer) fillWidth = `${percentage}%`

                                    return (
                                        <div key={index} className='relative h-6 w-6'>
                                            <FaStar className='text-gray-300 h-6 w-6' />
                                            <div
                                                className="absolute top-0 left-0 h-6 overflow-hidden"
                                                style={{ width: fillWidth }}
                                            >
                                                <FaStar className='text-yellow-300 h-6 w-6' />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}
                        <span className='text-xs'>{displayRating}/5 based on <strong>{movie.vote_count}</strong> votes</span>
                    </footer>
                </div>
            </div>
        </div>
    )
}