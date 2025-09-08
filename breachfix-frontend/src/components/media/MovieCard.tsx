import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  // Episode-specific fields
  episodeNumber?: number;
  seasonNumber?: number;
  tvShowId?: {
    _id: string;
    title: string;
    description?: string;
    posterUrl?: string;
    thumbnail_url_s3?: string;
  };
  // TV Show-specific fields
  seasons?: number;
  episodes?: number;
  status?: string;
  // Content type indicator
  type?: 'movie' | 'tvshow' | 'episode';
}

interface MovieCardProps {
  movie: Movie;
  baseUrl?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, baseUrl = '/movies' }) => {
  // Early return if movie is undefined or null
  if (!movie) {
    console.error('❌ MovieCard: Movie prop is undefined or null');
    return (
      <div className="relative group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg shadow-lg bg-netflix-gray">
          <div className="p-4 text-center text-white">
            <p className="text-sm">No Movie Data</p>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the movie/episode ID from various possible field names
  const getMovieId = () => {
    return movie._id || movie.id || movie.movieId || movie.movie_id || movie.episodeId || movie.episode_id;
  };

  // Determine the correct route based on content type
  const getCorrectRoute = () => {
    // Check the type field first (most reliable)
    if (movie.type) {
      switch (movie.type) {
        case 'episode':
          return '/media/episodes';
        case 'tvshow':
          return '/media/tvshows';
        case 'movie':
          return '/media/movies';
        default:
          break;
      }
    }

    // Fallback: Check if it's an episode (has episodeNumber and seasonNumber)
    if (movie.episodeNumber && movie.seasonNumber) {
      return '/media/episodes';
    }

    // Fallback: Check if it's a TV show (has seasons or episodes count, or specific TV show indicators)
    if (movie.seasons || movie.episodes || movie.status) {
      return '/media/tvshows';
    }

    // Default to movies
    return baseUrl || '/media/movies';
  };

  // Try multiple possible image URL fields
  const getImageUrl = () => {
    // Check all possible image URL fields
    const possibleUrls = [
      movie.posterFileUrl,
      movie.thumbnail_url_s3,
      movie.poster,
      movie.thumbnail,
      movie.imageUrl
    ].filter(Boolean);

    // If we have any URL, use the first one
    if (possibleUrls.length > 0) {
      const url = possibleUrls[0];
      
      // If it's a relative URL, make it absolute
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        // Check if it starts with /api or similar
        if (url.startsWith('/')) {
          return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}${url}`;
        }
        // If it's just a filename, construct the full URL
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}/uploads/${url}`;
      }
      
      return url;
    }

    // Fallback to placeholder
    const safeTitle = movie.title || 'Unknown Title';
    return `https://placehold.co/300x450/141414/ffffff?text=${encodeURIComponent(safeTitle)}`;
  };

  const posterUrl = getImageUrl();

  // Handle movie click
  const handleMovieClick = () => {
    if (import.meta.env.DEV) {
      console.log('🎬 Movie clicked:', {
        movieId: movieId,
        title: movie.title,
        baseUrl: baseUrl,
        smartRoute: getCorrectRoute(),
        navigationUrl: `${getCorrectRoute()}/${movieId}`,
        contentType: movie.type || 'unknown'
      });
    }
  };

  const movieId = getMovieId();

  // Prevent navigation if no valid movie ID
  if (!movieId) {
    console.error('❌ MovieCard: No valid movie ID found for movie:', movie);
    return (
      <div className="relative group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg shadow-lg bg-netflix-gray">
          <div className="p-4 text-center text-white">
            <p className="text-sm">Invalid Movie Data</p>
            <p className="text-xs text-gray-400">{movie.title || 'Unknown Title'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('MovieCard Debug:', {
        movieId: movieId,
        title: movie.title || 'Unknown Title',
        baseUrl: baseUrl,
        smartRoute: getCorrectRoute(),
        navigationUrl: `${getCorrectRoute()}/${movieId}`,
        posterFileUrl: movie.posterFileUrl,
        thumbnail_url_s3: movie.thumbnail_url_s3,
        poster: movie.poster,
        thumbnail: movie.thumbnail,
        imageUrl: movie.imageUrl,
        finalUrl: posterUrl,
        // Content type detection
        type: movie.type,
        // Episode-specific fields
        episodeNumber: movie.episodeNumber,
        seasonNumber: movie.seasonNumber,
        tvShowTitle: movie.tvShowId?.title,
        // TV Show-specific fields
        seasons: movie.seasons,
        episodes: movie.episodes,
        status: movie.status,
        fullMovieObject: movie
      });
    }
  }, [movie, posterUrl, baseUrl, movieId]);

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      className="relative group cursor-pointer"
    >
      <Link to={`${getCorrectRoute()}/${movieId}`} onClick={handleMovieClick}>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          {/* Poster Image */}
          <img
            src={posterUrl}
            alt={movie.title || 'Movie Poster'}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const safeTitle = movie.title || 'Unknown Title';
              console.warn(`Failed to load image for movie: ${safeTitle}`, {
                attemptedUrl: posterUrl,
                movie: movie
              });
              e.currentTarget.src = `https://placehold.co/300x450/141414/ffffff?text=${encodeURIComponent(safeTitle)}`;
            }}
            onLoad={() => {
              if (import.meta.env.DEV) {
                const safeTitle = movie.title || 'Unknown Title';
                console.log(`Successfully loaded image for: ${safeTitle}`, posterUrl);
              }
            }}
          />
          
                    {/* Episode Badge - Always visible */}
          {movie.episodeNumber && movie.seasonNumber && (
            <div className="absolute top-2 right-2 bg-bridge-emerald text-bridge-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              S{movie.seasonNumber} E{movie.episodeNumber}
            </div>
          )}
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{movie.title || 'Unknown Title'}</h3>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{movie.description || 'No description available'}</p>
              
              {/* TV Show Info for Episodes */}
              {movie.tvShowId && (
                <div className="text-xs text-gray-400 mb-2">
                  From: <span className="text-netflix-red">{movie.tvShowId.title}</span>
                </div>
              )}
              
              {/* Genres */}
              <div className="flex flex-wrap gap-1 mb-2">
                {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 ? (
                  movie.genres.slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs bg-bridge-gold text-bridge-navy px-2 py-1 rounded"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    No genres
                  </span>
                )}
              </div>
              
              {/* Rating and Duration */}
              <div className="flex items-center justify-between text-sm text-gray-300">
                {movie.rating && typeof movie.rating === 'number' && !isNaN(movie.rating) ? (
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{movie.rating.toFixed(1)}</span>
                  </div>
                ) : null}
                {movie.duration && typeof movie.duration === 'number' && !isNaN(movie.duration) ? (
                  <span>{Math.floor(movie.duration / 60)}m</span>
                ) : null}
                {movie.isFree ? (
                  <span className="text-green-400 font-semibold">FREE</span>
                ) : (
                  <span className="text-netflix-red font-semibold">
                    ${movie.price && typeof movie.price === 'number' ? movie.price.toFixed(2) : '0.00'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-bridge-gold text-bridge-navy p-3 rounded-full shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
