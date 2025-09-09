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
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-br from-amber-900 via-breachfix-navy to-amber-800 rounded-2xl p-8 mb-8 border border-amber-400 border-opacity-40 backdrop-blur-sm relative overflow-hidden hover:border-opacity-70 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30"
      >
        {/* Temple-Inspired Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-breachfix-gold/10 opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 animate-pulse shadow-lg shadow-amber-500/50"></div>
        
        {/* Pillar of Fire Effect */}
        <div className="absolute top-4 right-4 w-3 h-20 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full opacity-60 animate-pulse shadow-lg shadow-amber-500/40"></div>
        <div className="absolute top-6 right-6 w-1 h-16 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full opacity-80 animate-pulse"></div>
        
        {/* Temple Gold Veins */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-breachfix-gold to-transparent animate-pulse"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-4 relative"
          >
            <span className="bg-gradient-to-r from-amber-300 via-breachfix-gold to-amber-400 bg-clip-text text-transparent animate-pulse">
              Why We Surface Changes
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-80 shadow-lg shadow-amber-500/50"></div>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-amber-100 text-lg max-w-3xl mx-auto leading-relaxed font-medium"
          >
            "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them." — Isaiah 8:20
            <br /><br />
            Our sacred commitment to truth drives us to highlight translation changes that may affect doctrine and understanding. 
            We believe in transparency, accuracy, and preserving the integrity of God's Word.
          </motion.p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gradient-to-br from-amber-900/30 to-breachfix-navy/50 border border-amber-400 border-opacity-40 rounded-2xl p-6 hover:border-opacity-70 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 backdrop-blur-sm relative overflow-hidden group"
          >
            {/* Temple-Inspired Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-4xl flex-shrink-0 bg-gradient-to-br from-amber-500 to-breachfix-gold rounded-full p-3 w-16 h-16 flex items-center justify-center shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 transition-all duration-300 group-hover:scale-110">
                {reason.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-100 mb-3 leading-tight group-hover:text-amber-300 transition-colors duration-300">
                  {reason.title}
                </h3>
                <p className="text-amber-200 leading-relaxed text-sm group-hover:text-amber-50 transition-colors duration-300">
                  {reason.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sacred Commitment Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-12 bg-gradient-to-br from-amber-800 via-breachfix-navy to-amber-900 border border-amber-400 border-opacity-50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden hover:border-opacity-80 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/40"
      >
        {/* Temple Offering Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-breachfix-gold/10 opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 animate-pulse shadow-lg shadow-amber-500/60"></div>
        
        {/* Sacred Flame Effects */}
        <div className="absolute top-6 left-6 w-2 h-12 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full opacity-70 animate-pulse shadow-lg shadow-amber-500/50"></div>
        <div className="absolute top-8 left-8 w-1 h-8 bg-gradient-to-b from-yellow-200 to-amber-500 rounded-full opacity-90 animate-pulse"></div>
        
        <div className="text-center relative z-10">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-2xl md:text-3xl font-bold mb-4 relative"
          >
            <span className="bg-gradient-to-r from-amber-300 via-breachfix-gold to-amber-400 bg-clip-text text-transparent">
              Our Sacred Commitment
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-80 shadow-lg shadow-amber-500/50"></div>
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-amber-100 text-lg max-w-4xl mx-auto leading-relaxed mb-6 font-medium"
          >
            "Sanctify them through thy truth: thy word is truth." — John 17:17
            <br /><br />
            We are committed to preserving the truth of Scripture while making it accessible to all people in their native languages. 
            Our approach combines scholarly rigor with spiritual discernment and divine guidance.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            <div className="bg-gradient-to-br from-amber-900/30 to-breachfix-navy/50 border border-amber-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">🎯</div>
              <h4 className="text-amber-300 font-bold mb-3 text-lg relative z-10">Sacred Accuracy</h4>
              <p className="text-amber-100 text-sm relative z-10">Precise translation based on the best available manuscripts and divine guidance</p>
            </div>
            <div className="bg-gradient-to-br from-amber-900/30 to-breachfix-navy/50 border border-amber-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">🛡️</div>
              <h4 className="text-amber-300 font-bold mb-3 text-lg relative z-10">Divine Integrity</h4>
              <p className="text-amber-100 text-sm relative z-10">Preserving doctrinal truth and spiritual meaning through Holy Spirit guidance</p>
            </div>
            <div className="bg-gradient-to-br from-amber-900/30 to-breachfix-navy/50 border border-amber-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">🌐</div>
              <h4 className="text-amber-300 font-bold mb-3 text-lg relative z-10">Sacred Accessibility</h4>
              <p className="text-amber-100 text-sm relative z-10">Making Scripture available in every language with divine accuracy</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ChangedReasons;
