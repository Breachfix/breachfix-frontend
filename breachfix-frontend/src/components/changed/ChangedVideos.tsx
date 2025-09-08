import React from 'react';
import { motion } from 'framer-motion';
import { changedVideos } from '../../content/changed/videos';

const ChangedVideos: React.FC = () => {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-8 mb-8"
      >
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Video Snippets
          </h2>
          <p className="text-gray-200 text-lg max-w-3xl mx-auto leading-relaxed">
            Short clips from scholars and theologians explaining why translation changes matter for doctrine and understanding. 
            Learn from experts who have dedicated their lives to preserving the truth of Scripture.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {changedVideos.map((video: any, index: number) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-netflix-dark-gray rounded-2xl overflow-hidden hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative overflow-hidden">
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">🎥</div>
                  <p className="text-sm font-medium">Video Thumbnail</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-netflix-red rounded-full p-3">
                    <span className="text-white text-xl">▶️</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-orange-600 rounded-full p-2 flex-shrink-0">
                  <span className="text-white text-sm">📺</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-orange-400 text-sm font-medium mb-2">
                    {video.speaker}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {video.description}
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <span>▶️</span>
                Watch Video
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Video Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8"
      >
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Featured Video Series
          </h3>
          <p className="text-gray-200 text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            Our comprehensive video series explores the most significant translation changes and their doctrinal implications. 
            Each episode is carefully researched and presented by biblical scholars.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-purple-800 bg-opacity-30 rounded-xl p-6">
              <div className="text-3xl mb-3">🎓</div>
              <h4 className="text-purple-300 font-bold mb-2 text-lg">Scholarly Approach</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Each video is backed by extensive research and presented by qualified biblical scholars and theologians.
              </p>
            </div>
            <div className="bg-purple-800 bg-opacity-30 rounded-xl p-6">
              <div className="text-3xl mb-3">📚</div>
              <h4 className="text-purple-300 font-bold mb-2 text-lg">Educational Content</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Learn about textual criticism, manuscript evidence, and how translation choices affect our understanding of Scripture.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ChangedVideos;
