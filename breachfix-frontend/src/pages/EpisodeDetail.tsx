import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, useMediaApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';
import MovieCard from '../components/media/MovieCard';
import { ApiService } from '../utils/api';

interface Episode {
  _id?: string;
  id?: string;
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
  episodeNumber: number;
  seasonNumber: number;
  tvShowId?: {
    _id: string;
    title: string;
    description: string;
    posterUrl?: string;
    thumbnail_url_s3?: string;
  };
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  videoUrl?: string;
  movieFileUrl?: string;
}

interface SimilarEpisode {
  _id?: string;
  id?: string;
  episodeId?: string;
  episode_id?: string;
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
  episodeNumber: number;
  seasonNumber: number;
}

const EpisodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Early return if no ID is provided - prevent API calls with undefined
  if (!id || id === 'undefined' || (typeof id === 'string' && id.trim() === '')) {
    if (import.meta.env.DEV) {
      console.error('🔍 EpisodeDetail: Invalid ID detected:', { 
        id, 
        type: typeof id, 
        isString: typeof id === 'string',
        length: typeof id === 'string' ? id.length : 'N/A',
        stringified: JSON.stringify(id)
      });
      console.error('🔍 EpisodeDetail: Preventing component render to avoid undefined API calls');
    }
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Invalid Episode ID</h1>
          <p className="text-gray-400">No valid episode ID provided.</p>
          <Link to="/media" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Media
          </Link>
        </div>
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.log('🔍 EpisodeDetail: Valid ID provided:', {
      id: id,
      type: typeof id,
      length: typeof id === 'string' ? id.length : 'N/A',
      url: window.location.href,
      pathname: window.location.pathname
    });
  }

  // Fetch episode details
  const { data: episodeResponse, isLoading, error } = useApi<{ data?: Episode; episode?: Episode } | Episode>(
    ['episode', id],
    `/media/episodes/${id}`,
    { 
      staleTime: 1000 * 60 * 5,
      enabled: !!id
    }
  );

  // Extract episode data from possible response structures
  const episode = (episodeResponse as any)?.data || (episodeResponse as any)?.episode || episodeResponse;

  // Get the episode ID from various possible field names
  const getEpisodeId = (episodeObj: Episode | undefined) => {
    return episodeObj?._id || episodeObj?.id || episodeObj?.episodeId || episodeObj?.episode_id;
  };

  // Debug logging for episode data
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎬 EpisodeDetail: Episode data received:', {
        episodeResponse: episodeResponse,
        extractedEpisode: episode,
        isLoading: isLoading,
        error: error,
        episodeTitle: episode?.title,
        episodeDescription: episode?.description,
        episodeId: getEpisodeId(episode),
        episodePrice: episode?.price,
        episodeIsFree: episode?.isFree,
        episodeNumber: episode?.episodeNumber,
        seasonNumber: episode?.seasonNumber,
        tvShowTitle: episode?.tvShowId?.title,
        fullEpisodeObject: episode
      });
    }
  }, [episodeResponse, episode, isLoading, error]);

  // Fetch similar episodes
  const { data: similarEpisodes } = useMediaApi.episodes.useGetSimilar(id, {
    limit: 6
  }, {
    staleTime: 1000 * 60 * 5,
    enabled: !!id
  });

  // Check if user has access to this episode
  const { data: accessData } = useApi<{ hasAccess: boolean }>(
    ['episode-access', id],
    `/media/episodes/${id}/access`,
    { 
      enabled: isAuthenticated && !!episode && !!id
    }
  );

  const handlePlay = () => {
    if (episode?.isFree || accessData?.hasAccess) {
      // Navigate to video player
      window.location.href = `/watch/episode/${id}`;
    } else {
      // Show purchase options modal
      setShowPurchaseModal(true);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add episodes to your favorites.');
      return;
    }
    
    try {
      // Call the new favorites API
      await ApiService.favorites.addToFavorites({
        mediaId: id,
        type: 'episode',
        title: episode?.title || 'Unknown Episode',
        description: episode?.description || '',
        thumbnailUrl: episode?.posterFileUrl || episode?.thumbnail_url_s3 || episode?.poster || episode?.thumbnail || episode?.imageUrl,
        videoUrl: episode?.movieFileUrl,
        platform: 'media',
        metadata: {
          genres: episode?.genres,
          language: episode?.language,
          duration: episode?.duration,
          releaseDate: episode?.releaseDate,
          episodeNumber: episode?.episodeNumber,
          seasonNumber: episode?.seasonNumber,
          tvShowTitle: episode?.tvShowId?.title,
          director: episode?.director,
          cast: episode?.cast
        }
      });
      
      // Show success message
      alert('Episode added to favorites!');
      
      // Optionally refresh the episode data to update UI
      // You could invalidate the query cache here if needed
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 409) {
        alert('This episode is already in your favorites!');
      } else {
        alert('Failed to add episode to favorites. Please try again.');
      }
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like episodes.');
      return;
    }
    
    try {
      // Call the API to toggle like status
      await ApiService.post(`/media/episodes/${id}/like`);
      
      // Show success message
      alert('Episode liked!');
      
      // Optionally refresh the episode data to update UI
    } catch (error: any) {
      console.error('Error liking episode:', error);
      alert('Failed to like episode. Please try again.');
    }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Please log in to rate episodes.');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }
    
    try {
      // Call the API to rate the episode
      await ApiService.post(`/media/episodes/${id}/rate`, { rating });
      
      // Show success message
      alert(`Episode rated ${rating} stars!`);
      
      // Optionally refresh the episode data to update UI
    } catch (error: any) {
      console.error('Error rating episode:', error);
      alert('Failed to rate episode. Please try again.');
    }
  };

  // Purchase Modal Component
  const PurchaseModal = () => {
    if (!showPurchaseModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-netflix-dark-gray p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-white mb-4">Purchase Episode</h3>
          <p className="text-gray-300 mb-4">
            This episode requires purchase to watch. Price: ${episode?.price || 2.99}
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

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Episode not found</h1>
          <p className="text-gray-400">The episode you're looking for doesn't exist.</p>
          <Link to="/media" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Media
          </Link>
        </div>
      </div>
    );
  }

  const posterUrl = episode.posterFileUrl || episode.thumbnail_url_s3 || `https://placehold.co/400x600/141414/ffffff?text=${episode.title}`;

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
            {/* Episode Badge - Top Left */}
            <div className="absolute top-8 left-8 bg-netflix-red text-white px-4 py-2 rounded-full text-lg font-bold">
              S{episode.seasonNumber} E{episode.episodeNumber}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {episode.title}
            </h1>
            
            {/* TV Show Link */}
            {episode.tvShowId && (
              <div className="mb-4">
                <span className="text-gray-400 text-lg">From: </span>
                <Link 
                  to={`/media/tvshows/${episode.tvShowId._id}`}
                  className="text-netflix-red hover:text-red-400 font-semibold text-lg"
                >
                  {episode.tvShowId.title}
                </Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              {episode.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{episode.rating.toFixed(1)}</span>
                </div>
              )}
              {episode.duration && (
                <span>{Math.floor(episode.duration / 60)}m {episode.duration % 60}s</span>
              )}
              {episode.releaseDate && (
                <span>{new Date(episode.releaseDate).getFullYear()}</span>
              )}
              <span className="text-green-400 font-semibold">
                {episode.isFree ? 'FREE' : `$${episode.price}`}
              </span>
            </div>

            <p className="text-lg text-gray-300 mb-6 max-w-2xl line-clamp-3">
              {episode.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {episode.genres?.map((genre: string, index: number) => (
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
                {episode.isFree || accessData?.hasAccess ? 'Play' : 'Purchase'}
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

              {episode.trailerUrl && (
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
              <p className="text-gray-300 leading-relaxed">{episode.description}</p>
            </div>

            {/* Cast & Crew */}
            {(episode.director || episode.cast) && (
              <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-netflix-white mb-4">Cast & Crew</h2>
                {episode.director && (
                  <div className="mb-4">
                    <span className="text-gray-400">Director: </span>
                    <span className="text-white">{episode.director}</span>
                  </div>
                )}
                {episode.cast && episode.cast.length > 0 && (
                  <div>
                    <span className="text-gray-400">Cast: </span>
                    <span className="text-white">{episode.cast.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Similar Episodes */}
            {similarEpisodes && (similarEpisodes as any)?.data && (similarEpisodes as any).data.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-netflix-white mb-6">More Like This</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(similarEpisodes as any).data.map((similarEpisode: SimilarEpisode) => (
                    <MovieCard
                      key={similarEpisode._id || similarEpisode.id}
                      movie={{
                        ...similarEpisode,
                        movieId: similarEpisode._id || similarEpisode.id,
                        posterFileUrl: similarEpisode.posterFileUrl || similarEpisode.thumbnail_url_s3 || similarEpisode.poster || similarEpisode.thumbnail || similarEpisode.imageUrl
                      }}
                      baseUrl="/media/episodes"
                    />
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
                  <span className="text-white capitalize">{episode.language}</span>
                </div>
                
                {episode.releaseDate && (
                  <div>
                    <span className="text-gray-400">Release Date: </span>
                    <span className="text-white">
                      {new Date(episode.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {episode.duration && (
                  <div>
                    <span className="text-gray-400">Duration: </span>
                    <span className="text-white">
                      {Math.floor(episode.duration / 60)}m {episode.duration % 60}s
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Season: </span>
                  <span className="text-white">{episode.seasonNumber}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Episode: </span>
                  <span className="text-white">{episode.episodeNumber}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Availability: </span>
                  <span className={`font-semibold ${episode.isFree ? 'text-green-400' : 'text-netflix-red'}`}>
                    {episode.isFree ? 'Free to Watch' : `$${episode.price} to Purchase`}
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
      {isPlaying && episode.trailerUrl && (
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
                src={episode.trailerUrl}
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

export default EpisodeDetail;
