import React, { useState } from 'react';
import { useMediaApi } from '../hooks/useApi';
import MovieCarousel from '../components/media/MovieCard';
import { motion } from 'framer-motion';

interface Episode {
  _id: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  isFree: boolean;
  price?: number;
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
}

const Episodes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFreeOnly, setIsFreeOnly] = useState(false);

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
    return params;
  };

  // Fetch episodes data
  const { data: episodesData, isLoading, error } = useMediaApi.episodes.useAll(
    buildQueryParams(),
    { 
      staleTime: 1000 * 60 * 2,
      retry: 1
    }
  );

  // Fetch featured episodes
  const { data: featuredEpisodes } = useMediaApi.episodes.useGetFeatured({
    limit: 10
  }, {
    staleTime: 1000 * 60 * 10,
    retry: 1
  });

  // Fetch trending episodes
  const { data: trendingEpisodes } = useMediaApi.episodes.useGetTrending({
    limit: 10,
    days: 7
  }, {
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  // Fetch hero content (mixed)
  const { data: heroContent } = useMediaApi.hero.useContent({
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  // Fetch genres
  const { data: genres } = useMediaApi.genres.useAll();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedGenre('');
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
      <div className="w-full px-4 py-8">
        <div className="text-red-500 text-center">
          Error loading episodes: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="w-full px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-netflix-white mb-4">Episodes</h1>
          
          {/* Search and Filters */}
          <div className="bg-netflix-dark-gray rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search episodes..."
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
                {genres && Array.isArray(genres) && genres.length > 0 ? (
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
                  <span className="text-gray-500 text-sm">No genres available</span>
                )}
              </div>

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
                  <option value="views-desc">Most Popular</option>
                  <option value="episodeNumber-asc">Episode Number</option>
                  <option value="seasonNumber-asc">Season Number</option>
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
        </div>

        {/* Content Sections */}
        <div>
          {/* Hero Episodes Section */}
          {heroContent && (heroContent as any)?.data && (heroContent as any).data.length > 0 && (
            <div className="mb-8">
              <MovieCarousel 
                title="Hero Episodes"
                movies={(heroContent as any).data.filter((item: any) => item.type === 'episode')} 
                baseUrl="/media/episodes" 
              />
            </div>
          )}

          {/* Featured Episodes Section */}
          {featuredEpisodes && (featuredEpisodes as any)?.data && (featuredEpisodes as any).data.length > 0 && (
            <div className="mb-8">
              <MovieCarousel 
                title="Featured Episodes"
                movies={(featuredEpisodes as any).data} 
                baseUrl="/media/episodes" 
              />
            </div>
          )}

          {/* Trending Episodes Section */}
          {trendingEpisodes && (trendingEpisodes as any)?.data && (trendingEpisodes as any).data.length > 0 && (
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
          {episodesData?.episodes && episodesData.episodes.length === 0 && !isLoading && (
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
      </div>
    </div>
  );
};

export default Episodes;
