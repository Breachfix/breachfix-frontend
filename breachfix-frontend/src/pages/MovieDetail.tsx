import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, useMediaApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';
import MovieCard from '../components/media/MovieCard';
import { ApiService } from '../utils/api';

interface Movie {
  _id?: string;
  id?: string;
  movieId?: string;
  movie_id?: string;
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
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  movieFileUrl?: string;
}

interface SimilarMovie {
  _id?: string;
  id?: string;
  movieId?: string;
  movie_id?: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  posterFileUrl?: string;
  thumbnail_url_s3?: string;
  poster?: string;
  thumbnail?: string;
  imageUrl?: string;
  rating?: number;
  isFree: boolean;
  price?: number;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Early return if no ID is provided - prevent API calls with undefined
  if (!id || id === 'undefined' || (typeof id === 'string' && id.trim() === '')) {
    if (import.meta.env.DEV) {
      console.error('🔍 MovieDetail: Invalid ID detected:', { 
        id, 
        type: typeof id, 
        isString: typeof id === 'string',
        length: typeof id === 'string' ? id.length : 'N/A',
        stringified: JSON.stringify(id)
      });
      console.error('🔍 MovieDetail: Preventing component render to avoid undefined API calls');
    }
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Invalid Movie ID</h1>
          <p className="text-gray-400">No valid movie ID provided.</p>
          <Link to="/media" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Media
          </Link>
        </div>
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.log('🔍 MovieDetail: Valid ID provided:', {
      id: id,
      type: typeof id,
      length: typeof id === 'string' ? id.length : 'N/A',
      url: window.location.href,
      pathname: window.location.pathname
    });
  }

  // Fetch movie details
  const { data: movieResponse, isLoading, error } = useApi<{ data?: Movie; movie?: Movie } | Movie>(
    ['movie', id],
    `/media/movies/${id}`,
    { 
      staleTime: 1000 * 60 * 5,
      enabled: !!id
    }
  );

  // Extract movie data from possible response structures
  const movie = (movieResponse as any)?.data || (movieResponse as any)?.movie || movieResponse;

  // Get the movie ID from various possible field names
  const getMovieId = (movieObj: Movie | undefined) => {
    return movieObj?._id || movieObj?.id || movieObj?.movieId || movieObj?.movie_id;
  };

  // Debug logging for movie data
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎬 MovieDetail: Movie data received:', {
        movieResponse: movieResponse,
        extractedMovie: movie,
        isLoading: isLoading,
        error: error,
        movieTitle: movie?.title,
        movieDescription: movie?.description,
        movieId: getMovieId(movie),
        moviePrice: movie?.price,
        movieIsFree: movie?.isFree,
        fullMovieObject: movie
      });
    }
  }, [movieResponse, movie, isLoading, error]);

  // Fetch similar movies
  const { data: similarMovies } = useMediaApi.movies.useSimilar(id, 6, {
    staleTime: 1000 * 60 * 5,
    enabled: !!id
  });

  // Check if user has access to this movie
  const { data: accessData } = useApi<{ hasAccess: boolean }>(
    ['movie-access', id],
    `/media/movies/${id}/access`,
    { 
      enabled: isAuthenticated && !!movie && !!id
    }
  );

  const handlePlay = () => {
    if (movie?.isFree || accessData?.hasAccess) {
      // Navigate to video player
      window.location.href = `/watch/movie/${id}`;
    } else {
      // Show purchase options modal
      setShowPurchaseModal(true);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add movies to your favorites.');
      return;
    }
    
    try {
      // Call the new favorites API
      await ApiService.favorites.addToFavorites({
        mediaId: id,
        type: 'movie',
        title: movie?.title || 'Unknown Movie',
        description: movie?.description || '',
        thumbnailUrl: movie?.posterFileUrl || movie?.thumbnail_url_s3 || movie?.poster || movie?.thumbnail || movie?.imageUrl,
        videoUrl: movie?.movieFileUrl,
        platform: 'media',
        metadata: {
          genres: movie?.genres,
          language: movie?.language,
          duration: movie?.duration,
          releaseDate: movie?.releaseDate,
          director: movie?.director,
          cast: movie?.cast
        }
      });
      
      // Show success message
      alert('Movie added to favorites!');
      
      // Optionally refresh the movie data to update UI
      // You could invalidate the query cache here if needed
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 409) {
        alert('This movie is already in your favorites!');
      } else {
        alert('Failed to add movie to favorites. Please try again.');
      }
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like movies.');
      return;
    }
    
    try {
      // Call the API to toggle like status
      await ApiService.post(`/media/movies/${id}/like`);
      
      // Show success message
      alert('Movie liked!');
      
      // Optionally refresh the movie data to update UI
    } catch (error: any) {
      console.error('Error liking movie:', error);
      alert('Failed to like movie. Please try again.');
    }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Please log in to rate movies.');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }
    
    try {
      // Call the API to rate the movie
      await ApiService.post(`/media/movies/${id}/rate`, { rating });
      
      // Show success message
      alert(`Movie rated ${rating} stars!`);
      
      // Optionally refresh the movie data to update UI
    } catch (error: any) {
      console.error('Error rating movie:', error);
      alert('Failed to rate movie. Please try again.');
    }
  };

  // Purchase Modal Component
  const PurchaseModal = () => {
    if (!showPurchaseModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-netflix-dark-gray p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-white mb-4">Purchase Movie</h3>
          <p className="text-gray-300 mb-4">
            This movie requires purchase to watch. Price: ${movie?.price || 9.99}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="flex-1 bg-netflix-gray text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // TODO: Implement actual purchase flow
                alert('Purchase functionality coming soon!');
                setShowPurchaseModal(false);
              }}
              className="flex-1 bg-netflix-red text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    );
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

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Movie not found</h1>
          <p className="text-gray-400">The movie you're looking for doesn't exist.</p>
          <Link to="/movies" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const posterUrl = movie.posterFileUrl || movie.thumbnail_url_s3 || `https://placehold.co/400x600/141414/ffffff?text=${movie.title}`;

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center flex items-end"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${posterUrl})`
        }}
      >
        <div className="w-full px-4 pb-16">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {movie.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              {movie.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              )}
              {movie.duration && (
                <span>{Math.floor(movie.duration / 60)}m</span>
              )}
              {movie.releaseDate && (
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              )}
              <span className="text-green-400 font-semibold">
                {movie.isFree ? 'FREE' : `$${movie.price}`}
              </span>
            </div>

            <p className="text-lg text-gray-300 mb-6 max-w-2xl line-clamp-3">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {movie.genres?.map((genre: string, index: number) => (
                <span
                  key={index}
                  className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>



            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePlay}
                className="bg-netflix-white text-netflix-black py-3 px-8 rounded-lg font-bold hover:bg-gray-300 transition-colors duration-200 flex items-center"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {movie.isFree || accessData?.hasAccess ? 'Play' : 'Purchase'}
              </button>
              
              <button
                onClick={handleAddToFavorites}
                className="bg-netflix-gray text-white py-3 px-8 rounded-lg font-bold hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Add to My List
              </button>

              <button
                onClick={handleLike}
                className="bg-netflix-gray text-white py-3 px-8 rounded-lg font-bold hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Like
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Rate:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              {movie.trailerUrl && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="bg-transparent border border-white text-white py-3 px-8 rounded-lg font-bold hover:bg-white hover:text-netflix-black transition-colors duration-200 flex items-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-netflix-white mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Cast & Crew */}
            {(movie.director || movie.cast) && (
              <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-netflix-white mb-4">Cast & Crew</h2>
                {movie.director && (
                  <div className="mb-4">
                    <span className="text-gray-400">Director: </span>
                    <span className="text-white">{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span className="text-gray-400">Cast: </span>
                    <span className="text-white">{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Similar Movies */}
            {similarMovies?.movies && similarMovies.movies.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-netflix-white mb-6">More Like This</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {similarMovies.movies.map((similarMovie: SimilarMovie) => (
                    <MovieCard key={similarMovie._id} movie={similarMovie} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-netflix-dark-gray rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-netflix-white mb-4">Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Language: </span>
                  <span className="text-white capitalize">{movie.language}</span>
                </div>
                
                {movie.releaseDate && (
                  <div>
                    <span className="text-gray-400">Release Date: </span>
                    <span className="text-white">
                      {new Date(movie.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {movie.duration && (
                  <div>
                    <span className="text-gray-400">Duration: </span>
                    <span className="text-white">
                      {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Availability: </span>
                  <span className={`font-semibold ${movie.isFree ? 'text-green-400' : 'text-netflix-red'}`}>
                    {movie.isFree ? 'Free to Watch' : `$${movie.price} to Purchase`}
                  </span>
                </div>

                {isAuthenticated && accessData && (
                  <div>
                    <span className="text-gray-400">Your Access: </span>
                    <span className={`font-semibold ${accessData.hasAccess ? 'text-green-400' : 'text-red-400'}`}>
                      {accessData.hasAccess ? 'You can watch this' : 'Purchase required'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {isPlaying && movie.trailerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                src={movie.trailerUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal />
    </div>
  );
};

export default MovieDetail;
