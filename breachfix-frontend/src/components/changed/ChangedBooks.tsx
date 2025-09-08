import React from 'react';
import { motion } from 'framer-motion';
import { changedBooks } from '../../content/changed/books';

const ChangedBooks: React.FC = () => {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-8 mb-8"
      >
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Books & Resources
          </h2>
          <p className="text-gray-200 text-lg max-w-3xl mx-auto leading-relaxed">
            Essential reading from leading scholars and theologians on textual criticism, translation integrity, and preserving the truth of Scripture. 
            These resources provide deep insights into the importance of accurate Bible translation.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {changedBooks.map((book: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-netflix-dark-gray rounded-2xl p-6 hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-3 w-16 h-16 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-blue-400 text-sm font-medium mb-3">
                  by {book.author}
                </p>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {book.description}
                </p>
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  <span>🔗</span>
                  View Resource
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Resource Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 bg-gradient-to-r from-teal-900 to-cyan-900 rounded-2xl p-8"
      >
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Featured Resource Collection
          </h3>
          <p className="text-gray-200 text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            Our curated collection of resources represents decades of scholarly research and theological insight. 
            Each resource has been carefully selected for its contribution to understanding biblical translation and textual integrity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-teal-800 bg-opacity-30 rounded-xl p-6">
              <div className="text-3xl mb-3">📖</div>
              <h4 className="text-teal-300 font-bold mb-2 text-lg">Academic Excellence</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Resources from leading universities and theological seminaries worldwide.
              </p>
            </div>
            <div className="bg-teal-800 bg-opacity-30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="text-teal-300 font-bold mb-2 text-lg">Research-Based</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Evidence-based analysis of manuscript traditions and translation methodologies.
              </p>
            </div>
            <div className="bg-teal-800 bg-opacity-30 rounded-xl p-6">
              <div className="text-3xl mb-3">⚖️</div>
              <h4 className="text-teal-300 font-bold mb-2 text-lg">Balanced Perspective</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Multiple viewpoints from scholars across different theological traditions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ChangedBooks;
