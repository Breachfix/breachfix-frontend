// src/pages/Home.tsx
import React, { useEffect } from 'react';
import { useAuthStore } from '../context/AuthContext';
import { useMediaApi } from '../hooks/useApi';
import { motion } from 'framer-motion';
import MovieCard from '../components/media/MovieCard';

// Define a type for your movie data based on the API documentation
interface Movie {
  _id: string;
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
  // Content type indicator
  type?: 'movie' | 'tvshow' | 'episode';
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
}

const Home: React.FC = () => {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the component mounts
    initializeAuth();
  }, [initializeAuth]);

  // Use the new media API hooks - unified hero content for all media types
  const { data: heroContent, isLoading: heroLoading, error: heroError } = useMediaApi.hero.useContent({
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Fallback to random hero content if main hero content fails
  const { data: randomHeroContent, isLoading: randomHeroLoading, error: randomHeroError } = useMediaApi.hero.useRandomContent({
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Use getAll with sorting instead of non-existent trending endpoint
  const { data: trendingMovies, isLoading: trendingLoading, error: trendingError } = useMediaApi.movies.useAll({
    limit: 10,
    sortBy: 'views',
    sortOrder: 'desc'
  }, {
    staleTime: 1000 * 60 * 5
  });

  const { data: featuredMovies, isLoading: featuredLoading, error: featuredError } = useMediaApi.movies.useRandomHeroContent({
    staleTime: 1000 * 60 * 5
  });

  const { data: actionMovies, isLoading: actionLoading, error: actionError } = useMediaApi.movies.useAll({
    genre: 'action',
    limit: 10
  }, {
    staleTime: 1000 * 60 * 5
  });

  const { data: comedyMovies, isLoading: comedyLoading, error: comedyError } = useMediaApi.movies.useAll({
    genre: 'comedy',
    limit: 10
  }, {
    staleTime: 1000 * 60 * 5
  });

  const { data: dramaMovies, isLoading: dramaLoading, error: dramaError } = useMediaApi.movies.useAll({
    genre: 'drama',
    limit: 10
  }, {
    staleTime: 1000 * 60 * 5
  });

  if (heroLoading || randomHeroLoading || trendingLoading || featuredLoading || actionLoading || comedyLoading || dramaLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
        ></motion.div>
        <span className="ml-4">Loading BreachFix...</span>
      </div>
    );
  }

  if (heroError || randomHeroError || trendingError || featuredError || actionError || comedyError || dramaError) {
    return <div className="text-breachfix-gold text-center p-8">Error loading content. Please try again later.</div>;
  }

  // Helper function to get image URL (same logic as MovieCard)
  const getImageUrl = (movie: Movie) => {
    const possibleUrls = [
      movie.posterFileUrl,
      movie.thumbnail_url_s3,
      movie.poster,
      movie.thumbnail,
      movie.imageUrl
    ].filter(Boolean);

    if (possibleUrls.length > 0) {
      const url = possibleUrls[0];
      
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        if (url.startsWith('/')) {
          return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}${url}`;
        }
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}/uploads/${url}`;
      }
      
      return url;
    }

    return `https://placehold.co/1280x720/141414/ffffff?text=${encodeURIComponent(movie.title)}`;
  };

  // Choose a hero item - prioritize hero content, then random hero, then featured, then trending
  const selectedHero = heroContent && (heroContent as any)?.data && (heroContent as any).data.length > 0
    ? (heroContent as any).data[Math.floor(Math.random() * (heroContent as any).data.length)]
    : randomHeroContent && (randomHeroContent as any)?.data && (randomHeroContent as any).data.length > 0
    ? (randomHeroContent as any).data[Math.floor(Math.random() * (randomHeroContent as any).data.length)]
    : featuredMovies && featuredMovies.length > 0
    ? featuredMovies[Math.floor(Math.random() * featuredMovies.length)]
    : trendingMovies?.movies && trendingMovies.movies.length > 0
    ? trendingMovies.movies[Math.floor(Math.random() * trendingMovies.movies.length)]
    : null;

  const heroImageUrl = selectedHero ? getImageUrl(selectedHero) : null;

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('🏠 Home Page Debug:', {
      heroContent: heroContent,
      heroContentData: (heroContent as any)?.data,
      heroContentLength: (heroContent as any)?.data?.length || 0,
      randomHeroContent: randomHeroContent,
      randomHeroData: (randomHeroContent as any)?.data,
      randomHeroLength: (randomHeroContent as any)?.data?.length || 0,
      selectedHero: selectedHero,
      heroImageUrl: heroImageUrl,
      featuredMovies: featuredMovies,
      trendingMovies: trendingMovies
    });

    // Log content types for routing verification
    if ((heroContent as any)?.data) {
      console.log('🎬 Featured Content Types:', (heroContent as any).data.map((item: any) => ({
        title: item.title,
        type: item.type,
        id: item._id
      })));
    }
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Hero Section */}
      {selectedHero ? (
        <div
          className="relative h-[60vh] md:h-[80vh] bg-cover bg-center flex items-end p-8 md:p-16 rounded-b-lg shadow-xl"
          style={{ 
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%), url(${heroImageUrl})` 
          }}
        >
          <div className="max-w-xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{selectedHero.title}</h1>
            <p className="text-lg md:text-xl mb-6 line-clamp-3 drop-shadow-lg">{selectedHero.description}</p>
            
            {/* Genres */}
            {selectedHero.genres && selectedHero.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedHero.genres.slice(0, 3).map((genre: string, index: number) => (
                  <span
                    key={`hero-genre-${index}`}
                    className="text-sm bg-breachfix-gold text-breachfix-navy px-3 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button className="bg-netflix-white text-netflix-black py-3 px-8 rounded-lg font-bold hover:bg-gray-300 transition-colors duration-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                </svg>
                Play
              </button>
              <button className="bg-netflix-gray text-white py-3 px-8 rounded-lg font-bold hover:bg-gray-600 transition-colors duration-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
                More Info
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Fallback hero section when no content is available
        <div className="relative h-[60vh] md:h-[80vh] bg-gradient-to-br from-netflix-red via-red-800 to-netflix-black flex items-center justify-center p-8 md:p-16 rounded-b-lg shadow-xl">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Welcome to BreachFix</h1>
            <p className="text-lg md:text-xl mb-6 drop-shadow-lg">Discover amazing movies, TV shows, and episodes</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-netflix-white text-netflix-black py-3 px-8 rounded-lg font-bold hover:bg-gray-300 transition-colors duration-200">
                Explore Content
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 mt-8">
        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 text-xs">
            <h3 className="text-white font-bold mb-2">Debug Info:</h3>
            <div className="text-gray-300 space-y-1">
              <div>Hero Content: {heroContent ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>Hero Data: {(heroContent as any)?.data ? '✅ Available' : '❌ No data'}</div>
              <div>Hero Length: {(heroContent as any)?.data?.length || 0}</div>
              <div>Random Hero: {randomHeroContent ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>Random Hero Data: {(randomHeroContent as any)?.data ? '✅ Available' : '❌ No data'}</div>
              <div>Random Hero Length: {(randomHeroContent as any)?.data?.length || 0}</div>
              <div>Selected Hero: {selectedHero ? '✅ Selected' : '❌ None selected'}</div>
              <div>Hero Image URL: {heroImageUrl ? '✅ Available' : '❌ No image'}</div>
            </div>
          </div>
        )}

        {/* Personalized Welcome Message */}
        {isAuthenticated && user && (
          <h2 className="text-3xl font-bold mb-6 text-netflix-white">
            Welcome back, {user.username}!
          </h2>
        )}

        {/* Featured Content Section */}
        {heroContent && (heroContent as any)?.data && (heroContent as any).data.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Featured Content</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(heroContent as any).data.slice(0, 10).map((item: Movie, index: number) => (
                <MovieCard 
                  key={item._id || `hero-item-${index}`} 
                  movie={item} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Movies Section */}
        {trendingMovies?.movies && trendingMovies.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingMovies.movies.slice(0, 10).map((movie: Movie, index: number) => (
                <MovieCard 
                  key={movie._id || `trending-movie-${index}`} 
                  movie={movie} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Movies Section */}
        {actionMovies?.movies && actionMovies.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Action & Adventure</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {actionMovies.movies.slice(0, 10).map((movie: Movie, index: number) => (
                <MovieCard 
                  key={movie._id || `action-movie-${index}`} 
                  movie={movie} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Comedy Movies Section */}
        {comedyMovies?.movies && comedyMovies.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Comedy</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {comedyMovies.movies.slice(0, 10).map((movie: Movie, index: number) => (
                <MovieCard 
                  key={movie._id || `comedy-movie-${index}`} 
                  movie={movie} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Drama Movies Section */}
        {dramaMovies?.movies && dramaMovies.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Drama</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {dramaMovies.movies.slice(0, 10).map((movie: Movie, index: number) => (
                <MovieCard 
                  key={movie._id || `drama-movie-${index}`} 
                  movie={movie} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Continue Watching Section (if user is authenticated) */}
        {isAuthenticated && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-netflix-white mb-4">Continue Watching</h2>
            <div className="text-gray-400 text-center py-8">
              <p>Your watch history will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
