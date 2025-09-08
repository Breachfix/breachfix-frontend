import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import MovieCarousel from '../components/media/MovieCarousel';
import { motion } from 'framer-motion';

interface Movie {
  _id: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  isFree: boolean;
  price?: number;
  posterFileUrl: string;
  thumbnail_url_s3: string;
  rating?: number;
  duration?: number;
  releaseDate?: string;
}

interface Genre {
  _id: string;
  name: string;
  slug: string;
}

const Movies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFreeOnly, setIsFreeOnly] = useState(false);

  // Fetch genres
  const { data: genres } = useApi<Genre[]>(['genres'], '/media/genres');

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedGenre) params.append('genre', selectedGenre);
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);
    if (currentPage) params.append('page', currentPage.toString());
    params.append('limit', '20');
    if (isFreeOnly) params.append('isFree', 'true');
    return params.toString();
  };

  // Fetch movies with current filters
  const { data: moviesData, isLoading, error } = useApi<{ movies: Movie[]; total: number; pages: number }>(
    ['movies', searchQuery, selectedGenre, sortBy, order, currentPage.toString(), isFreeOnly.toString()],
    `/media/movies?${buildQueryParams()}`,
    { staleTime: 1000 * 60 * 2 } // 2 minutes
  );

  // Fetch hero content for featured section
  const { data: heroMovies } = useApi<Movie[]>(
    ['heroMovies'],
    '/media/movies/hero-content',
    { staleTime: 1000 * 60 * 5 }
  );

  // Fetch trending movies
  const { data: trendingMoviesData } = useApi<{ movies: Movie[]; total: number; pages: number }>(
    ['trendingMovies'],
    '/media/movies?sortBy=trackView&order=desc&limit=10',
    { staleTime: 1000 * 60 * 5 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    setCurrentPage(1);
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Debug logging for development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎬 Movies.tsx Debug:', {
        heroMovies: heroMovies,
        trendingMoviesData: trendingMoviesData,
        moviesData: moviesData,
        heroMoviesLength: heroMovies?.length,
        trendingMoviesLength: trendingMoviesData?.movies?.length,
        moviesDataLength: moviesData?.movies?.length
      });
    }
  }, [heroMovies, trendingMoviesData, moviesData]);

  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-red-500 text-center">
          Error loading movies: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bridge-navy">
      <div className="w-full px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-bridge-white mb-4">Movies</h1>
          
          {/* Search and Filters */}
          <div className="bg-bridge-dark rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-bridge-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-bridge-gold"
                />
                <button
                  type="submit"
                  className="bg-bridge-gold hover:bg-yellow-500 text-bridge-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Genre Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-bridge-white">Genres:</span>
                {genres?.map((genre) => (
                  <button
                    key={genre._id}
                    onClick={() => handleGenreChange(genre.slug)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      selectedGenre === genre.slug
                        ? 'bg-bridge-gold text-bridge-white'
                        : 'bg-bridge-gray text-bridge-white hover:bg-gray-500'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-bridge-white">Sort by:</span>
                <select
                  value={`${sortBy}-${order}`}
                  onChange={(e) => {
                    const [newSortBy, newOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setOrder(newOrder);
                    setCurrentPage(1);
                  }}
                  className="bg-bridge-gray text-bridge-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-bridge-gold"
                >
                  <option value="releaseDate-desc">Newest First</option>
                  <option value="releaseDate-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="trackView-desc">Most Popular</option>
                </select>
              </div>

              {/* Free Only Toggle */}
              <label className="flex items-center gap-2 text-bridge-white">
                <input
                  type="checkbox"
                  checked={isFreeOnly}
                  onChange={(e) => {
                    setIsFreeOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded focus:ring-2 focus:ring-bridge-gold"
                />
                Free Only
              </label>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {heroMovies && heroMovies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bridge-white mb-4">Featured Movies</h2>
            <MovieCarousel movies={heroMovies} title="Featured Movies" baseUrl="/media/movies" />
          </div>
        )}

        {/* Trending Section */}
        {trendingMoviesData?.movies && trendingMoviesData.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bridge-white mb-4">Trending Now</h2>
            <MovieCarousel movies={trendingMoviesData.movies} title="Trending Now" baseUrl="/media/movies" />
          </div>
        )}

        {/* Search Results */}
        {searchQuery && moviesData?.movies && moviesData.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bridge-white mb-4">
              Search Results for "{searchQuery}" ({moviesData.total} movies)
            </h2>
            <MovieCarousel movies={moviesData.movies} title={`Search Results for "${searchQuery}"`} baseUrl="/media/movies" />
          </div>
        )}

        {/* All Movies Grid */}
        {!searchQuery && moviesData?.movies && moviesData.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bridge-white mb-4">All Movies</h2>
            <MovieCarousel movies={moviesData.movies} title="All Movies" baseUrl="/media/movies" />
          </div>
        )}

        {/* No Results */}
        {moviesData?.movies && moviesData.movies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No movies found</div>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Pagination */}
        {moviesData && moviesData.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-bridge-gray hover:bg-gray-500 disabled:opacity-50 text-bridge-white px-4 py-2 rounded transition-colors duration-200"
            >
              Previous
            </button>
            
            <span className="text-bridge-white px-4">
              Page {currentPage} of {moviesData.pages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(moviesData.pages, currentPage + 1))}
              disabled={currentPage === moviesData.pages}
              className="bg-bridge-gray hover:bg-gray-500 disabled:opacity-50 text-bridge-white px-4 py-2 rounded transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
