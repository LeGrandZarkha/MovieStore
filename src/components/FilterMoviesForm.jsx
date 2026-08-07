export default function FilterMoviesForm({ setFilters, filters, moviesGenre, initialFilters }) {

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className='relative flex flex-wrap gap-6 items-start border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50'
        >
            <div className='flex flex-col gap-1'>
                <label htmlFor="title" className='text-sm font-semibold'>Titre
                    <input name="title" id="title" type="text" value={filters.title}
                        onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                        className='block mt-1 px-2 py-1 border border-gray-300 rounded text-sm' />
                </label>
            </div>

            <div className='flex flex-col gap-1'>
                <label htmlFor="genre" className='text-sm font-semibold'>Genre</label>
                <div className='grid grid-cols-3 gap-x-4 gap-y-1 max-w-md'>
                    {moviesGenre.map(genre => (
                        <label key={genre.id} className='flex items-center gap-1.5 text-sm font-normal cursor-pointer'>
                            <input type="checkbox" value={genre.id} name={genre.name} id={genre.name}
                                checked={filters.genres.includes(genre.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFilters({ ...filters, genres: filters.genres.concat(Number(e.target.value)) })
                                    } else {
                                        setFilters({ ...filters, genres: filters.genres.filter(id => id !== Number(e.target.value)) })
                                    }
                                }} />
                            {genre.name}
                        </label>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-1'>
                <label htmlFor="rating" className='text-sm font-semibold'>Note
                    <input name="rating" id="rating" type="range" min="0" max="10" step="0.5"
                        value={filters.rating ?? 0}
                        onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
                        className='block mt-1 w-44' />
                </label>
            </div>
            <button type="button" className="absolute bottom-[10%] right-[5%] border-1 border-solid rounded-sm p-1 hover:cursor-pointer hover:bg-teal-100 transition delay-50" onClick={() => setFilters(initialFilters)}>Reset Filters X</button>
        </form>
    )
}