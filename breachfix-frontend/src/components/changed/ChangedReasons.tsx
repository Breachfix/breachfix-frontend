import React from 'react';
import { motion } from 'framer-motion';

const ChangedReasons: React.FC = () => {
  const reasons = [
    {
      title: "To the law and to the testimony…",
      content: "If they speak not according to this word, it is because there is no light in them. (Isaiah 8:20) We test teachings by Scripture, not tradition.",
      icon: "📖"
    },
    {
      title: "Change it not.",
      content: "God's word is living and enduring; we approach translation with reverence and care (cf. Proverbs 30:5–6; Isaiah 40:8).",
      icon: "⚖️"
    },
    {
      title: "Clarity for truth.",
      content: "Some wording shifts can obscure key doctrines (e.g., nature of Christ, atonement, sanctuary, Sabbath). We surface changes to keep the gospel clear.",
      icon: "🔍"
    },
    {
      title: "Receive the text.",
      content: "We aim to align translations with the received text witnesses, yet we're not \"KJV-only.\" KJV is often the most aligned in English, but we respect other faithful translations.",
      icon: "📜"
    },
    {
      title: "Edify every language.",
      content: "This is not about English only; it's about truth in every tongue (e.g., Kirundi, Spanish, Portuguese…).",
      icon: "🌍"
    },
    {
      title: "Transparency.",
      content: "We show what changed, why it changed, and how it affects doctrine—inviting honest, prayerful evaluation.",
      icon: "💡"
    }
  ];

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mb-8"
      >
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why We Surface Changes
          </h2>
          <p className="text-gray-200 text-lg max-w-3xl mx-auto leading-relaxed">
            Our commitment to truth drives us to highlight translation changes that may affect doctrine and understanding. 
            We believe in transparency, accuracy, and preserving the integrity of God's Word.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-netflix-dark-gray rounded-2xl p-6 hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0 bg-gradient-to-br from-netflix-red to-red-600 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                {reason.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {reason.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {reason.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Our Commitment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-8"
      >
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Our Commitment
          </h3>
          <p className="text-gray-200 text-lg max-w-4xl mx-auto leading-relaxed mb-6">
            We are committed to preserving the truth of Scripture while making it accessible to all people in their native languages. 
            Our approach combines scholarly rigor with spiritual discernment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-green-800 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="text-green-300 font-semibold mb-2">Accuracy</h4>
              <p className="text-gray-300 text-sm">Precise translation based on the best available manuscripts</p>
            </div>
            <div className="bg-green-800 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="text-green-300 font-semibold mb-2">Integrity</h4>
              <p className="text-gray-300 text-sm">Preserving doctrinal truth and spiritual meaning</p>
            </div>
            <div className="bg-green-800 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="text-green-300 font-semibold mb-2">Accessibility</h4>
              <p className="text-gray-300 text-sm">Making Scripture available in every language</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ChangedReasons;
