import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, useMediaApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';
import MovieCard from '../components/media/MovieCard';

interface TVShow {
  _id: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  isFree: boolean;
  price?: number;
  posterFileUrl: string;
  thumbnail_url_s3?: string;
  rating?: number;
  status?: string;
  seasons?: number;
  episodes?: number;
  releaseDate?: string;
  creator?: string;
  cast?: string[];
  trailerUrl?: string;
}

interface Episode {
  _id: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  duration?: number;
  thumbnail_url_s3?: string;
  videoFileUrl?: string;
  isFree: boolean;
  price?: number;
}

interface SimilarTVShow {
  _id: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  posterFileUrl: string;
  thumbnail_url_s3?: string;
  rating?: number;
  isFree: boolean;
  price?: number;
}

const TVShowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Early return if no ID is provided
  if (!id) {
    if (import.meta.env.DEV) {
      console.error('🔍 TVShowDetail: No ID provided, showing error page');
    }
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Invalid TV Show ID</h1>
          <p className="text-gray-400">No TV show ID provided.</p>
          <Link to="/media" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Media
          </Link>
        </div>
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.log('🔍 TVShowDetail: Valid ID provided:', id);
  }

  const { data: tvShow, isLoading, error } = useMediaApi.tvshows.useById(id, {
    staleTime: 1000 * 60 * 5,
    enabled: !!id
  });

  // Debug logging for development
  React.useEffect(() => {
    if (String(import.meta.env.DEV) === 'true') {
      console.log('🔍 TVShowDetail Debug:', {
        id,
        tvShow,
        isLoading,
        error,
        hasData: !!tvShow,
        dataType: typeof tvShow,
        timestamp: new Date().toISOString()
      });
    }
  }, [id, tvShow, isLoading, error]);

  // Fetch episodes for selected season
  const { data: episodes } = useMediaApi.episodes.useByTVShow(id, {
    seasonNumber: selectedSeason,
    limit: 50
  }, {
    enabled: !!tvShow && !!id, 
    staleTime: 1000 * 60 * 5 
  });

  // Fetch similar TV shows
  const { data: similarTVShows } = useMediaApi.tvshows.useSimilar(id, 6, {
    staleTime: 1000 * 60 * 5
  });

  // Check if user has access to this TV show
  const { data: accessData } = useApi<{ hasAccess: boolean }>(
    ['tvshow-access', id],
    `/media/tvshows/${id}/access`,
    { 
      enabled: isAuthenticated && !!tvShow && !!id
    }
  );

  const handlePlayEpisode = (episode: Episode) => {
    if (episode.isFree || accessData?.hasAccess) {
      // Navigate to video player
      window.location.href = `/watch/episode/${episode._id}`;
    } else {
      // Show purchase options
      alert('This episode requires purchase to watch.');
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add TV shows to your favorites.');
      return;
    }
    // TODO: Implement add to favorites API call
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full mb-4"
        />
        <div className="text-netflix-white text-lg">Loading TV Show...</div>
        {String(import.meta.env.DEV) === 'true' && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center max-w-md">
            <div className="text-gray-300 text-sm font-semibold mb-2">Loading Debug Info:</div>
            <div className="text-gray-400 text-xs space-y-1">
              <div>ID: {id}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Has Data: {!!tvShow}</div>
              <div>Error: {error ? (error as any)?.message || 'Unknown error' : 'None'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">TV Show not found</h1>
          <p className="text-gray-400">
            {error ? `Error: ${(error as any)?.message || 'Unknown error'}` : 'The TV show you\'re looking for doesn\'t exist.'}
          </p>
          {String(import.meta.env.DEV) === 'true' && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left max-w-md">
              <div className="text-gray-300 text-sm font-semibold mb-2">Debug Info:</div>
              <div className="text-gray-400 text-xs space-y-1">
                <div>ID: {id}</div>
                <div>Error: {error ? (error as any)?.message || 'Unknown error' : 'None'}</div>
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Has Data: {!!tvShow}</div>
                <div>Data Type: {typeof tvShow}</div>
              </div>
            </div>
          )}
          <Link to="/media" className="text-netflix-red hover:text-red-400 mt-4 inline-block">
            Back to Media
          </Link>
        </div>
      </div>
    );
  }

  const posterUrl = tvShow.posterFileUrl || tvShow.thumbnail_url_s3 || `https://placehold.co/400x600/141414/ffffff?text=${tvShow.title}`;

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center flex items-end"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${posterUrl})`
        }}
      >
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {tvShow.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              {tvShow.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{tvShow.rating.toFixed(1)}</span>
                </div>
              )}
              {tvShow.seasons && (
                <span>{tvShow.seasons} Season{tvShow.seasons > 1 ? 's' : ''}</span>
              )}
              {tvShow.episodes && (
                <span>{tvShow.episodes} Episode{tvShow.episodes > 1 ? 's' : ''}</span>
              )}
              {tvShow.releaseDate && (
                <span>{new Date(tvShow.releaseDate).getFullYear()}</span>
              )}
              <span className="text-green-400 font-semibold">
                {tvShow.isFree ? 'FREE' : `$${tvShow.price}`}
              </span>
            </div>

            <p className="text-lg text-gray-300 mb-6 max-w-2xl line-clamp-3">
              {tvShow.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {tvShow.genres?.map((genre: string, index: number) => (
                <span
                  key={index}
                  className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
              {tvShow.status && (
                <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm capitalize">
                  {tvShow.status}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddToFavorites}
                className="bg-netflix-gray text-white py-3 px-8 rounded-lg font-bold hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Add to My List
              </button>

              {tvShow.trailerUrl && (
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-netflix-white mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{tvShow.description}</p>
            </div>

            {/* Cast & Crew */}
            {(tvShow.creator || tvShow.cast) && (
              <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-netflix-white mb-4">Cast & Crew</h2>
                {tvShow.creator && (
                  <div className="mb-4">
                    <span className="text-gray-400">Creator: </span>
                    <span className="text-white">{tvShow.creator}</span>
                  </div>
                )}
                {tvShow.cast && tvShow.cast.length > 0 && (
                  <div>
                    <span className="text-gray-400">Cast: </span>
                    <span className="text-white">{tvShow.cast.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Episodes */}
            {episodes && episodes.length > 0 && (
              <div className="bg-netflix-dark-gray rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-netflix-white">Episodes</h2>
                  {tvShow.seasons && tvShow.seasons > 1 && (
                    <div className="flex gap-2">
                      {Array.from({ length: tvShow.seasons }, (_, i) => i + 1).map((season) => (
                        <button
                          key={season}
                          onClick={() => setSelectedSeason(season)}
                          className={`px-3 py-1 rounded transition-colors duration-200 ${
                            selectedSeason === season
                              ? 'bg-netflix-red text-white'
                              : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Season {season}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {episodes.map((episode: Episode) => (
                    <div key={episode._id} className="flex items-center space-x-4 p-4 bg-netflix-gray rounded-lg">
                      <img
                        src={episode.thumbnail_url_s3 || `https://placehold.co/120x68/141414/ffffff?text=${episode.title}`}
                        alt={episode.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">
                          {episode.episodeNumber}. {episode.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2">{episode.description}</p>
                        {episode.duration && (
                          <p className="text-gray-400 text-xs">{Math.floor(episode.duration / 60)}m</p>
                        )}
                      </div>
                      <button
                        onClick={() => handlePlayEpisode(episode)}
                        className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200"
                      >
                        {episode.isFree || accessData?.hasAccess ? 'Play' : `$${episode.price}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

                    {/* Similar TV Shows */}
        {similarTVShows?.tvshows && similarTVShows.tvshows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-6">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarTVShows.tvshows.map((similarTVShow: SimilarTVShow) => (
                <MovieCard key={similarTVShow._id} movie={similarTVShow} baseUrl="/tvshows" />
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
                  <span className="text-white capitalize">{tvShow.language}</span>
                </div>
                
                {tvShow.releaseDate && (
                  <div>
                    <span className="text-gray-400">Release Date: </span>
                    <span className="text-white">
                      {new Date(tvShow.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {tvShow.seasons && (
                  <div>
                    <span className="text-gray-400">Seasons: </span>
                    <span className="text-white">{tvShow.seasons}</span>
                  </div>
                )}
                
                {tvShow.episodes && (
                  <div>
                    <span className="text-gray-400">Episodes: </span>
                    <span className="text-white">{tvShow.episodes}</span>
                  </div>
                )}
                
                {tvShow.status && (
                  <div>
                    <span className="text-gray-400">Status: </span>
                    <span className="text-white capitalize">{tvShow.status}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Availability: </span>
                  <span className={`font-semibold ${tvShow.isFree ? 'text-green-400' : 'text-netflix-red'}`}>
                    {tvShow.isFree ? 'Free to Watch' : `$${tvShow.price} to Purchase`}
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
      {isPlaying && tvShow.trailerUrl && (
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
                src={tvShow.trailerUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TVShowDetail;
