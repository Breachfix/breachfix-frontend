import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../context/AuthContext';
import { useMediaApi } from '../../hooks/useApi';

interface UploadFormData {
  title: string;
  description: string;
  genre: string;
  language: string;
  isFree: boolean;
  price?: number;
  releaseDate?: string;
  duration?: number;
  status?: string; // For TV shows
  seasons?: number; // For TV shows
}

const UploadSection: React.FC = () => {
  const { user } = useAuthStore();
  const [uploadType, setUploadType] = useState<'movie' | 'tvshow' | 'episode'>('movie');
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    isFree: true,
    price: 0,
    releaseDate: '',
    duration: 0,
    status: 'ongoing',
    seasons: 1,
  });
  const [selectedFiles, setSelectedFiles] = useState<{
    poster?: File;
    video?: File;
    trailer?: File;
  }>({});
  const [uploadProgress, setUploadProgress] = useState<{
    poster?: number;
    video?: number;
    trailer?: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const fileInputRefs = {
    poster: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    trailer: useRef<HTMLInputElement>(null),
  };

  // Upload mutations
  const uploadPoster = useMediaApi.upload.useUploadPoster();
  const uploadVideo = useMediaApi.upload.useUploadVideo();
  const uploadTrailer = useMediaApi.upload.useUploadTrailer();
  const createMovie = useMediaApi.movies.useCreate();
  const createTVShow = useMediaApi.tvshows.useCreate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const handleFileSelect = (type: 'poster' | 'video' | 'trailer', file: File) => {
    setSelectedFiles(prev => ({ ...prev, [type]: file }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  };

  const handleFileInputChange = (type: 'poster' | 'video' | 'trailer') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setUploadStatus('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setUploadStatus('Description is required');
      return false;
    }
    if (!formData.genre) {
      setUploadStatus('Genre is required');
      return false;
    }
    if (!selectedFiles.poster) {
      setUploadStatus('Poster image is required');
      return false;
    }
    if (!selectedFiles.video) {
      setUploadStatus('Video file is required');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadStatus('Starting upload...');

    try {
      // Upload poster
      setUploadStatus('Uploading poster...');
      const posterResult = await uploadPoster.mutateAsync(selectedFiles.poster!);
      setUploadProgress(prev => ({ ...prev, poster: 100 }));

      // Upload video
      setUploadStatus('Uploading video...');
      const videoResult = await uploadVideo.mutateAsync(selectedFiles.video!);
      setUploadProgress(prev => ({ ...prev, video: 100 }));

      // Upload trailer if selected
      let trailerResult = null;
      if (selectedFiles.trailer) {
        setUploadStatus('Uploading trailer...');
        trailerResult = await uploadTrailer.mutateAsync(selectedFiles.trailer);
        setUploadProgress(prev => ({ ...prev, trailer: 100 }));
      }

      // Create media entry
      setUploadStatus('Creating media entry...');
      const mediaData = {
        ...formData,
        posterFileUrl: posterResult.data.url,
        videoFileUrl: videoResult.data.url,
        trailerFileUrl: trailerResult?.data.url,
        creator: user?._id,
      };

      if (uploadType === 'movie') {
        await createMovie.mutateAsync(mediaData);
      } else if (uploadType === 'tvshow') {
        await createTVShow.mutateAsync(mediaData);
      }

      setUploadStatus('Upload completed successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: '',
        language: 'English',
        isFree: true,
        price: 0,
        releaseDate: '',
        duration: 0,
        status: 'ongoing',
        seasons: 1,
      });
      setSelectedFiles({});
      setUploadProgress({});

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      language: 'English',
      isFree: true,
      price: 0,
      releaseDate: '',
      duration: 0,
      status: 'ongoing',
      seasons: 1,
    });
    setSelectedFiles({});
    setUploadProgress({});
    setUploadStatus('');
    
    // Reset file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-netflix-dark-gray rounded-lg p-6">
        <h2 className="text-2xl font-bold text-bridge-white mb-6">Upload Media</h2>

        {/* Upload Type Selection */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Media Type</label>
          <div className="flex space-x-4">
            {['movie', 'tvshow'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="uploadType"
                  value={type}
                  checked={uploadType === type}
                  onChange={(e) => setUploadType(e.target.value as 'movie' | 'tvshow')}
                  className="mr-2"
                />
                <span className="text-gray-300 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Genre *</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="">Select genre</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Release Date</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            {uploadType === 'movie' && (
              <div>
                <label className="block text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  placeholder="120"
                />
              </div>
            )}

            {uploadType === 'tvshow' && (
              <div>
                <label className="block text-gray-300 mb-2">Seasons</label>
                <input
                  type="number"
                  name="seasons"
                  value={formData.seasons}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  placeholder="1"
                  min="1"
                />
              </div>
            )}

            {uploadType === 'tvshow' && (
              <div>
                <label className="block text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              placeholder="Enter description"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                  className="mr-2"
                />
                Free Content
              </label>
            </div>

            {!formData.isFree && (
              <div>
                <label className="block text-gray-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  placeholder="9.99"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-bridge-white">Media Files</h3>

            {/* Poster Upload */}
            <div>
              <label className="block text-gray-300 mb-2">Poster Image *</label>
              <input
                ref={fileInputRefs.poster}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange('poster')}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
              {selectedFiles.poster && (
                <div className="mt-2 text-sm text-gray-400">
                  Selected: {selectedFiles.poster.name}
                </div>
              )}
              {uploadProgress.poster !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-bridge-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.poster}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-gray-300 mb-2">Video File *</label>
              <input
                ref={fileInputRefs.video}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange('video')}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
              {selectedFiles.video && (
                <div className="mt-2 text-sm text-gray-400">
                  Selected: {selectedFiles.video.name}
                </div>
              )}
              {uploadProgress.video !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-bridge-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.video}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trailer Upload */}
            <div>
              <label className="block text-gray-300 mb-2">Trailer (Optional)</label>
              <input
                ref={fileInputRefs.trailer}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange('trailer')}
                className="w-full bg-netflix-gray text-bridge-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
              {selectedFiles.trailer && (
                <div className="mt-2 text-sm text-gray-400">
                  Selected: {selectedFiles.trailer.name}
                </div>
              )}
              {uploadProgress.trailer !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-bridge-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.trailer}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-4 rounded-lg ${
              uploadStatus.includes('failed') || uploadStatus.includes('error')
                ? 'bg-red-600 text-red-100'
                : uploadStatus.includes('completed')
                ? 'bg-bridge-emerald text-bridge-white'
                : 'bg-bridge-emerald text-bridge-white'
            }`}>
              {uploadStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-bridge-gold hover:bg-yellow-500 disabled:bg-gray-600 text-bridge-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              {isUploading ? 'Uploading...' : 'Upload Media'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isUploading}
              className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSection;
