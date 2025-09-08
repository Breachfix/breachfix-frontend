import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';

interface Movie {
  _id?: string;
  id?: string;
  movieId?: string;
  movie_id?: string;
  episodeId?: string;
  episode_id?: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  isFree: boolean;
  price?: number;
  posterFileUrl?: string;
  thumbnail_url_s3?: string;
  poster?: string;
  thumbnail?: string;
  imageUrl?: string;
  rating?: number;
  duration?: number;
  releaseDate?: string;
}

interface MovieCarouselProps<T extends Movie> {
  title: string;
  movies: T[];
  baseUrl?: string;
}

const MovieCarousel = <T extends Movie>({ title, movies, baseUrl = '/movies' }: MovieCarouselProps<T>) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Debug logging in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎬 MovieCarousel Debug:', {
        title,
        baseUrl,
        moviesType: typeof movies,
        isArray: Array.isArray(movies),
        moviesLength: movies?.length || 0,
        firstMovie: movies?.[0],
        fullMoviesArray: movies
      });
    }
  }, [title, baseUrl, movies]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  // Filter out any undefined or null movies
  const validMovies = movies.filter(movie => movie && typeof movie === 'object');
  
  if (validMovies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-netflix-white">{title || 'Content'}</h2>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="bg-netflix-gray hover:bg-gray-600 text-white p-2 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="bg-netflix-gray hover:bg-gray-600 text-white p-2 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {validMovies.map((movie, index) => {
            // Get the movie/episode ID from various possible field names
            const movieId = movie._id || movie.id || movie.movieId || movie.movie_id || movie.episodeId || movie.episode_id || `movie-${index}`;
            
            return (
              <motion.div
                key={movieId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0 w-48 md:w-56 lg:w-64"
              >
                <MovieCard movie={movie} baseUrl={baseUrl} />
              </motion.div>
            );
          })}
        </div>

        {/* Gradient Overlays for Smooth Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-netflix-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-netflix-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default MovieCarousel;
