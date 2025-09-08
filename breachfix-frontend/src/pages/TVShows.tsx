import React, { useState } from 'react';
import { useMediaApi, useApi } from '../hooks/useApi';
import MovieCarousel from '../components/media/MovieCarousel';
import { motion } from 'framer-motion';



const TVShows: React.FC = () => {
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

  // Use the new media API hooks
  const { data: genres, isLoading: genresLoading, error: genresError } = useMediaApi.genres.useAll();
  
  const { data: tvShowsData, isLoading, error } = useMediaApi.tvshows.useAll(
    buildQueryParams(),
    { staleTime: 1000 * 60 * 2 }
  );

  const { data: trendingTVShows } = useMediaApi.tvshows.useTrending(10, 7, {
    staleTime: 1000 * 60 * 5
  });

  const { data: featuredTVShows, error: featuredError } = useMediaApi.tvshows.useFeatured({
    limit: 10
  }, {
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  // Backend health check
  const { data: healthStatus, error: healthError } = useApi<{ status: string; timestamp: string }>(
    ['health'],
    '/health',
    { 
      staleTime: 1000 * 60 * 5,
      retry: 1,
      enabled: String(import.meta.env.DEV) === 'true'
    }
  );

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
        console.log('Genres response structure:', {
          isArray: Array.isArray(genres),
          genresLength: genres?.length || 0
        });
      }
    }
  }, [featuredError, genresError, genres]);

  // Debug section for development
  const DebugInfo = () => {
    if (String(import.meta.env.DEV) !== 'true') return null;
    
    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-4 text-xs">
        <h3 className="text-white font-bold mb-2">Debug Info:</h3>
        <div className="text-breachfix-white space-y-1">
          <div>Backend Health: {healthError ? '❌ Failed' : healthStatus ? '✅ OK' : '⏳ Checking...'}</div>
          <div>Genres Loading: {genresLoading ? 'Yes' : 'No'}</div>
          <div>Genres Error: {genresError ? genresError.message : 'None'}</div>
          <div>Genres Count: {genres?.length || 0}</div>
          <div>Featured Error: {featuredError ? featuredError.message : 'None'}</div>
          <div>Featured Count: {(featuredTVShows as any)?.length || 0}</div>
          <div>API Base URL: {String(import.meta.env.VITE_API_BASE_URL || 'Not set')}</div>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">
          Error loading TV shows: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-breachfix-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info (Development Only) */}
        <DebugInfo />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-breachfix-white mb-4">TV Shows</h1>
          
          {/* Search and Filters */}
          <div className="bg-netflix-dark-gray rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search TV shows..."
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
                <span className="text-breachfix-white">Genres:</span>
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
                          : 'bg-netflix-gray text-breachfix-white hover:bg-gray-600'
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

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-breachfix-white">Status:</span>
                {['ongoing', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      statusFilter === status
                        ? 'bg-netflix-red text-white'
                        : 'bg-netflix-gray text-breachfix-white hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-breachfix-white">Sort by:</span>
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
              <label className="flex items-center gap-2 text-breachfix-white">
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
        </div>

        {/* Featured Section - Use trending as fallback if featured fails */}
        {(!featuredError && featuredTVShows && (featuredTVShows as any).length > 0) ? (
          <div className="mb-8">
            <MovieCarousel 
              title="Featured TV Shows"
              movies={featuredTVShows as any} 
              baseUrl="/tvshows" 
            />
          </div>
        ) : (featuredError && trendingTVShows && trendingTVShows.length > 0) ? (
          <div className="mb-8">
            <MovieCarousel 
              title="Featured TV Shows"
              movies={trendingTVShows} 
              baseUrl="/tvshows" 
            />
            {String(import.meta.env.DEV) === 'true' && (
              <p className="text-gray-500 text-sm mt-2">
                Note: Using trending shows as featured fallback (featured endpoint unavailable)
              </p>
            )}
          </div>
        ) : null}

        {/* Trending Section */}
        {trendingTVShows && trendingTVShows.length > 0 && (
          <div className="mb-8">
            <MovieCarousel 
              title="Trending Now"
              movies={trendingTVShows} 
              baseUrl="/tvshows" 
            />
          </div>
        )}

        {/* Search Results */}
        {searchQuery && tvShowsData?.tvshows && tvShowsData.tvshows.length > 0 && (
          <div className="mb-8">
            <MovieCarousel 
              title={`Search Results for "${String(searchQuery)}" (${tvShowsData.total.toString()} TV shows)`}
              movies={tvShowsData.tvshows} 
              baseUrl="/tvshows" 
            />
          </div>
        )}

        {/* All TV Shows Grid */}
        {!searchQuery && tvShowsData?.tvshows && tvShowsData.tvshows.length > 0 && (
          <div className="mb-8">
            <MovieCarousel 
              title="All TV Shows"
              movies={tvShowsData.tvshows} 
              baseUrl="/tvshows" 
            />
          </div>
        )}

        {/* No Results */}
        {tvShowsData?.tvshows && tvShowsData.tvshows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No TV shows found</div>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
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
            
            <span className="text-breachfix-white px-4">
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
    </div>
  );
};

export default TVShows;
