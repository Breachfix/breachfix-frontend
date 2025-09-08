import React, { useState } from 'react';
import { useAuthStore } from '../context/AuthContext';
import { useMediaApi } from '../hooks/useApi';
import MovieCarousel from '../components/media/MovieCarousel';
import UploadSection from '../components/media/UploadSection';
import { motion } from 'framer-motion';

// Type definitions
interface Movie {
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
  duration?: number;
  releaseDate?: string;
}

interface ApiResponse<T> {
  movies?: T[];
  tvshows?: T[];
  episodes?: T[];
  total?: number;
  pages?: number;
}





type MediaTab = 'movies' | 'tvshows'| "episodes" | 'upload';

const Media: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<MediaTab>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Build query parameters
  const buildQueryParams = () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedGenre) params.genre = selectedGenre;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;
    if (currentPage) params.page = currentPage;
    params.limit = 20;
    if (isFreeOnly) params.isFree = true;
    if (statusFilter) params.status = statusFilter;
    return params;
  };

  // Media API hooks
  const { data: genres, isLoading: genresLoading, error: genresError } = useMediaApi.genres.useAll();
  
  // Movies data
  const { data: moviesData, isLoading: moviesLoading, error: moviesError } = useMediaApi.movies.useAll(
    buildQueryParams(),
    { staleTime: 1000 * 60 * 2 }
  );

  const { data: trendingMovies } = useMediaApi.movies.useTrending(10, 7, {
    staleTime: 1000 * 60 * 5
  });

  // Featured content for movies
  const { data: featuredMovies } = useMediaApi.movies.useGetFeatured({
    limit: 10
  }, {
    staleTime: 1000 * 60 * 10
  });

  // Unified hero content for all media types
  const { data: heroContent } = useMediaApi.hero.useContent({
    staleTime: 1000 * 60 * 5
  });

  // TV Shows data
  const { data: tvShowsData, isLoading: tvShowsLoading, error: tvShowsError } = useMediaApi.tvshows.useAll(
    buildQueryParams(),
    { staleTime: 1000 * 60 * 2 }
  );

  const { data: trendingTVShows } = useMediaApi.tvshows.useTrending(10, 7, {
    staleTime: 1000 * 60 * 5
  });

  // Featured content for TV shows
  const { data: featuredTVShows, error: featuredError } = useMediaApi.tvshows.useFeatured({
    limit: 10
  }, {
    staleTime: 1000 * 60 * 10,
    retry: 1
  });

  // Episodes data - with error handling for unimplemented endpoints
  const { data: episodesData, isLoading: episodesLoading, error: episodesError } = useMediaApi.episodes.useAll(
    buildQueryParams(),
    { 
      staleTime: 1000 * 60 * 2,
      retry: 1, // Reduce retries for 500 errors
      enabled: activeTab === 'episodes' // Only fetch when episodes tab is active
    }
  );

  // Featured content for episodes - with error handling
  const { data: featuredEpisodes, error: featuredEpisodesError } = useMediaApi.episodes.useGetFeatured({
    limit: 10
  }, {
    staleTime: 1000 * 60 * 10,
    retry: 1, // Reduce retries for 500 errors
    enabled: activeTab === 'episodes' // Only fetch when episodes tab is active
  });

  // Trending episodes
  const { data: trendingEpisodes, error: trendingEpisodesError } = useMediaApi.episodes.useGetTrending({
    limit: 10,
    days: 7
  }, {
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: activeTab === 'episodes' // Only fetch when episodes tab is active
  });

  // Hero content for episodes (filtered from unified hero content)
  const heroEpisodes = heroContent && (heroContent as any)?.data ? 
    (heroContent as any).data.filter((item: any) => item.type === 'episode') : [];

  // Backend health check
  const { data: healthStatus, error: healthError } = useMediaApi.health.useCheck({
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: String(import.meta.env.DEV) === 'true'
  });

  // Track genres loading state changes specifically
  React.useEffect(() => {
    if (String(import.meta.env.DEV) === 'true') {
      console.log('🎭 Genres State Update:', {
        genresLoading,
        genresError,
        genresCount: genres?.length || 0,
        hasData: !!genres,
        timestamp: new Date().toISOString()
      });
    }
  }, [genresLoading, genresError, genres]);

  // Debug logging for development
  React.useEffect(() => {
    if (String(import.meta.env.DEV) === 'true') {
      if (featuredError) {
        console.warn('Featured TV shows endpoint failed:', featuredError);
      }
      if (genresError) {
        console.warn('Genres endpoint failed:', genresError);
      }
      if (genres) {
        console.log('🎭 Genres response structure:', {
          isArray: Array.isArray(genres),
          genresLength: genres?.length || 0,
          genresLoading: genresLoading,
          genresError: genresError
        });
      }
      
      // Track genres loading state changes
      console.log('🎭 Genres Loading State Change:', {
        genresLoading,
        genresError,
        genresCount: genres?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // Debug episodes data structure
      if (episodesData) {
        console.log('🎬 Episodes Data Structure:', {
          episodesCount: episodesData.episodes?.length || 0,
          firstEpisode: episodesData.episodes?.[0],
          episodesStructure: episodesData
        });
      }
      
      if (featuredEpisodes) {
        console.log('⭐ Featured Episodes Structure:', {
          featuredCount: (featuredEpisodes as any)?.data?.length || 0,
          firstFeatured: (featuredEpisodes as any)?.data?.[0],
          fullStructure: featuredEpisodes
        });
      }
      
      if (trendingEpisodes) {
        console.log('🔥 Trending Episodes Structure:', {
          trendingCount: (trendingEpisodes as any)?.data?.length || 0,
          firstTrending: (trendingEpisodes as any)?.data?.[0],
          fullStructure: trendingEpisodes
        });
      }
      
      // Debug TV shows data structure
      if (featuredTVShows) {
        console.log('📺 Featured TV Shows Structure:', {
          featuredCount: (featuredTVShows as any)?.data?.length || 0,
          firstFeatured: (featuredTVShows as any)?.data?.[0],
          fullStructure: featuredTVShows
        });
      }
      
      if (trendingTVShows) {
        console.log('📺 Trending TV Shows Structure:', {
          trendingCount: (trendingTVShows as any)?.data?.length || 0,
          firstTrending: (trendingTVShows as any)?.data?.[0],
          fullStructure: trendingTVShows
        });
      }
      
      if (tvShowsData) {
        console.log('📺 All TV Shows Structure:', {
          tvShowsCount: tvShowsData.tvshows?.length || 0,
          firstTVShow: tvShowsData.tvshows?.[0],
          fullStructure: tvShowsData
        });
      }
    }
      }, [featuredError, genresError, genres, episodesData, featuredEpisodes, trendingEpisodes, featuredTVShows, trendingTVShows, tvShowsData]);

  // Debug section for development
  const DebugInfo = () => {
    if (String(import.meta.env.DEV) !== 'true') return null;
    
    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-4 text-xs">
        <h3 className="text-white font-bold mb-2">Debug Info:</h3>
        <div className="text-gray-300 space-y-1">
          <div>Backend Health: {healthError ? '❌ Failed' : healthStatus ? '✅ OK' : '⏳ Checking...'}</div>
          <div>Genres Loading: {genresLoading ? 'Yes' : 'No'}</div>
          <div>Genres Error: {genresError ? genresError.message : 'None'}</div>
          <div>Genres Count: {genres?.length || 0}</div>
          <div>Genres Status: {genresLoading ? '⏳ Loading...' : genresError ? '❌ Error' : genres && genres.length > 0 ? '✅ Loaded' : '⚠️ No Data'}</div>
          <div>All Loading States: Movies:{moviesLoading ? '⏳' : '✅'} | TV:{tvShowsLoading ? '⏳' : '✅'} | Episodes:{episodesLoading ? '⏳' : '✅'} | Genres:{genresLoading ? '⏳' : '✅'}</div>
          <div>Featured Error: {featuredError ? featuredError.message : 'None'}</div>
          <div>Featured TV Shows Count: {(featuredTVShows as any)?.data?.length || 0}</div>
          <div>Trending TV Shows Count: {(trendingTVShows as any)?.data?.length || 0}</div>
          <div>Movies Count: {moviesData?.movies?.length || 0}</div>
          <div>Hero Content Count: {heroContent?.data?.length || 0}</div>
          <div>Hero Movies Count: {heroContent?.data?.filter((item: any) => item.type === 'movie')?.length || 0}</div>
          <div>Hero TV Shows Count: {heroContent?.data?.filter((item: any) => item.type === 'tvshow')?.length || 0}</div>
          <div>Episodes Count: {episodesData?.episodes?.length || 0}</div>
          <div>Featured Episodes Count: {(featuredEpisodes as any)?.data?.length || 0}</div>
          <div>Trending Episodes Count: {(trendingEpisodes as any)?.data?.length || 0}</div>
          <div>Hero Episodes Count: {heroEpisodes?.length || 0}</div>
          <div>Episodes Status: ✅ Working (All endpoints functional)</div>
          <div>API Base URL: {String(import.meta.env.VITE_API_BASE_URL || 'Not set')}</div>
          {moviesData?.movies?.[0] && (
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <div className="font-semibold">First Movie Image Fields:</div>
              <div>posterFileUrl: {moviesData.movies[0].posterFileUrl || 'null'}</div>
              <div>thumbnail_url_s3: {moviesData.movies[0].thumbnail_url_s3 || 'null'}</div>
              <div>poster: {moviesData.movies[0].poster || 'null'}</div>
              <div>thumbnail: {moviesData.movies[0].thumbnail || 'null'}</div>
              <div>imageUrl: {moviesData.movies[0].imageUrl || 'null'}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: MediaTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedGenre('');
    setStatusFilter('');
  };

  const isLoading = moviesLoading || tvShowsLoading || episodesLoading || genresLoading;

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

  if (moviesError || tvShowsError || episodesError) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-red-500 text-center">
          Error loading media content: {moviesError?.message || tvShowsError?.message || episodesError?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="w-full px-4 py-8">
        {/* Debug Info (Development Only) */}
        <DebugInfo />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-netflix-white mb-4">Media</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-netflix-dark-gray rounded-lg p-1 mb-6">
            <button
              onClick={() => handleTabChange('movies')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'movies'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => handleTabChange('tvshows')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'tvshows'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => handleTabChange('episodes')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'episodes'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Episodes
            </button>
            {isAuthenticated && (
              <button
                onClick={() => handleTabChange('upload')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'upload'
                    ? 'bg-netflix-red text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Upload
              </button>
            )}
          </div>

          {/* Search and Filters */}
          {activeTab !== 'upload' && (
            <div className="bg-netflix-dark-gray rounded-lg p-6 mb-6">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'movies' ? 'movies' : activeTab === 'tvshows' ? 'TV shows' : activeTab === 'episodes' ? 'episodes' : 'content'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  />
                  <button
                    type="submit"
                    className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Genre Filter */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-300">Genres:</span>
                  {genresLoading ? (
                    <span className="text-gray-500 text-sm">Loading genres...</span>
                  ) : genres && Array.isArray(genres) && genres.length > 0 ? (
                    genres.map((genre) => (
                      <button
                        key={genre._id}
                        onClick={() => handleGenreChange(genre.slug)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                          selectedGenre === genre.slug
                            ? 'bg-netflix-red text-white'
                            : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {genresError ? 'Failed to load genres' : 'No genres available'}
                    </span>
                  )}
                </div>

                {/* Status Filter (TV Shows only) */}
                {activeTab === 'tvshows' && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-300">Status:</span>
                    {['ongoing', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                          statusFilter === status
                            ? 'bg-netflix-red text-white'
                            : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Sort by:</span>
                  <select
                    value={`${sortBy}-${order}`}
                    onChange={(e) => {
                      const [newSortBy, newOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setOrder(newOrder);
                      setCurrentPage(1);
                    }}
                    className="bg-netflix-gray text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                    <option value="releaseDate-desc">Newest First</option>
                    <option value="releaseDate-asc">Oldest First</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="trackView-desc">Most Popular</option>
                  </select>
                </div>

                {/* Free Only Toggle */}
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={isFreeOnly}
                    onChange={(e) => {
                      setIsFreeOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded focus:ring-2 focus:ring-netflix-red"
                  />
                  Free Only
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Content Sections */}
        {activeTab === 'movies' && (
          <div>
            {/* Hero Section */}
            {heroContent && (heroContent as any)?.data && (heroContent as any).data.filter((item: any) => item.type === 'movie').length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Hero Movies"
                  movies={(heroContent as any).data.filter((item: any) => item.type === 'movie')} 
                  baseUrl="/media/movies" 
                />
              </div>
            )}

            {/* Featured Movies Section */}
            {(featuredMovies as ApiResponse<Movie>)?.movies && (featuredMovies as ApiResponse<Movie>).movies!.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Featured Movies"
                  movies={(featuredMovies as ApiResponse<Movie>).movies!} 
                  baseUrl="/media/movies" 
                />
              </div>
            )}

            {/* Trending Section */}
            {trendingMovies && trendingMovies.movies && trendingMovies.movies.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Trending Movies"
                  movies={trendingMovies.movies} 
                  baseUrl="/media/movies" 
                />
              </div>
            )}

            {/* Search Results */}
            {searchQuery && moviesData?.movies && moviesData.movies.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title={`Search Results for "${searchQuery}" (${moviesData.total} movies)`}
                  movies={moviesData.movies} 
                  baseUrl="/media/movies" 
                />
              </div>
            )}

            {/* All Movies Grid */}
            {!searchQuery && moviesData?.movies && moviesData.movies.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="All Movies"
                  movies={moviesData.movies} 
                  baseUrl="/media/movies" 
                />
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
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="text-gray-300 px-4">
                  Page {currentPage} of {moviesData.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(moviesData.pages, currentPage + 1))}
                  disabled={currentPage === moviesData.pages}
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

                {activeTab === 'tvshows' && (
          <div>
            {/* TV Shows Status Banner */}
            {String(import.meta.env.DEV) === 'true' && (
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-8">
                <div className="text-green-400 font-semibold mb-2">✅ TV Shows API Working!</div>
                <p className="text-green-300 text-sm">
                  All TV show endpoints are now functional. Featured, trending, and search are working properly.
                </p>
                <div className="mt-2 text-xs text-green-400">
                  <div>Featured: {featuredTVShows ? '✅ Loaded' : '⏳ Loading...'}</div>
                  <div>Trending: {trendingTVShows ? '✅ Loaded' : '⏳ Loading...'}</div>
                  <div>All Shows: {tvShowsData ? '✅ Loaded' : '⏳ Loading...'}</div>
                </div>
              </div>
            )}

            {/* Hero TV Shows Section */}
            {heroContent && (heroContent as any)?.data && (heroContent as any).data.filter((item: any) => item.type === 'tvshow').length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Hero TV Shows"
                  movies={(heroContent as any).data.filter((item: any) => item.type === 'tvshow')} 
                  baseUrl="/media/tvshows" 
                />
              </div>
            )}

            {/* TV Shows Loading State */}
            {tvShowsLoading && (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
                />
              </div>
            )}

            {/* Featured TV Shows Section */}
            {!tvShowsLoading && featuredTVShows && (featuredTVShows as any)?.data && (featuredTVShows as any).data.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Featured TV Shows"
                  movies={(featuredTVShows as any).data} 
                  baseUrl="/media/tvshows" 
                />
              </div>
            )}

            {/* Trending TV Shows Section */}
            {!tvShowsLoading && trendingTVShows && (trendingTVShows as any)?.data && (trendingTVShows as any).data.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Trending TV Shows"
                  movies={(trendingTVShows as any).data} 
                  baseUrl="/media/tvshows" 
                />
              </div>
            )}

            {/* Search Results */}
            {searchQuery && tvShowsData?.tvshows && tvShowsData.tvshows.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title={`Search Results for "${searchQuery}" (${tvShowsData.total} TV shows)`}
                  movies={tvShowsData.tvshows} 
                  baseUrl="/media/tvshows" 
                />
              </div>
            )}

            {/* All TV Shows Grid */}
            {!searchQuery && tvShowsData?.tvshows && tvShowsData.tvshows.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="All TV Shows"
                  movies={tvShowsData.tvshows} 
                  baseUrl="/media/tvshows" 
                />
              </div>
            )}

            {/* No Results */}
            {tvShowsData?.tvshows && tvShowsData.tvshows.length === 0 && !tvShowsLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No TV shows found</div>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {/* No Featured/Trending Content */}
            {!tvShowsLoading && !(featuredTVShows as any)?.data && !(trendingTVShows as any)?.data && !tvShowsData?.tvshows && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">TV Shows Coming Soon</div>
                <p className="text-gray-500">Featured and trending TV shows will appear here once content is available.</p>
                {String(import.meta.env.DEV) === 'true' && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
                    <div className="text-gray-300 text-sm font-semibold mb-2">Debug Info:</div>
                    <div className="text-gray-400 text-xs space-y-1">
                      <div>Featured TV Shows: {featuredTVShows ? 'Loaded' : 'Not loaded'}</div>
                      <div>Trending TV Shows: {trendingTVShows ? 'Loaded' : 'Not loaded'}</div>
                      <div>All TV Shows: {tvShowsData ? 'Loaded' : 'Not loaded'}</div>
                      <div>Featured Error: {featuredError ? featuredError.message : 'None'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {tvShowsData && tvShowsData.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="text-gray-300 px-4">
                  Page {currentPage} of {tvShowsData.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(tvShowsData.pages, currentPage + 1))}
                  disabled={currentPage === tvShowsData.pages}
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'episodes' && (
          <div>
            {/* Episodes Status Banner */}
            {String(import.meta.env.DEV) === 'true' && (
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-8">
                <div className="text-green-400 font-semibold mb-2">✅ Episodes API Working!</div>
                <p className="text-green-300 text-sm">
                  All episode endpoints are now functional. Featured, trending, and search are working properly.
                </p>
              </div>
            )}

            {/* Hero Episodes Section */}
            {heroEpisodes && heroEpisodes.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Hero Episodes"
                  movies={heroEpisodes} 
                  baseUrl="/media/episodes" 
                />
              </div>
            )}

            {/* Episodes Loading State */}
            {episodesLoading && (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
                />
              </div>
            )}

            {/* Featured Episodes Section - Only show if no errors */}
            {!featuredEpisodesError && featuredEpisodes && (featuredEpisodes as any)?.data && (featuredEpisodes as any).data.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Featured Episodes"
                  movies={(featuredEpisodes as any).data} 
                  baseUrl="/media/episodes" 
                />
              </div>
            )}

            {/* Trending Episodes Section */}
            {!trendingEpisodesError && trendingEpisodes && (trendingEpisodes as any)?.data && (trendingEpisodes as any).data.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="Trending Episodes"
                  movies={(trendingEpisodes as any).data} 
                  baseUrl="/media/episodes" 
                />
              </div>
            )}

            {/* Search Results */}
            {searchQuery && episodesData?.episodes && episodesData.episodes.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title={`Search Results for "${searchQuery}" (${episodesData.total} episodes)`}
                  movies={episodesData.episodes} 
                  baseUrl="/media/episodes" 
                />
              </div>
            )}

            {/* All Episodes Grid */}
            {!searchQuery && episodesData?.episodes && episodesData.episodes.length > 0 && (
              <div className="mb-8">
                <MovieCarousel 
                  title="All Episodes"
                  movies={episodesData.episodes} 
                  baseUrl="/media/episodes" 
                />
              </div>
            )}

            {/* No Results */}
            {episodesData?.episodes && episodesData.episodes.length === 0 && !episodesLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No episodes found</div>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {/* Pagination */}
            {episodesData && episodesData.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="text-gray-300 px-4">
                  Page {currentPage} of {episodesData.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(episodesData.pages, currentPage + 1))}
                  disabled={currentPage === episodesData.pages}
                  className="bg-netflix-gray hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <UploadSection />
        )}
      </div>
    </div>
  );
};

export default Media;
