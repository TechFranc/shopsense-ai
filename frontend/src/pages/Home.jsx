import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiPieChart, FiZap, FiTrendingUp, FiChevronLeft, FiChevronRight, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

import receiptImg from '../assets/images/receipt.jpg';
import analyticsImg from '../assets/images/analytics.jpg';
import savingsImg from '../assets/images/savings.jpg';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  const slides = [
    {
      image: receiptImg,
      title: 'AI Receipt Scanning',
      description: 'Upload receipts and let AI extract all the data automatically'
    },
    {
      image: analyticsImg,
      title: 'Smart Analytics',
      description: 'Beautiful charts and insights about your spending patterns'
    },
    {
      image: savingsImg,
      title: 'Save Money',
      description: 'Get personalized recommendations to spend smarter'
    }
  ];

  const features = [
    {
      icon: FiUpload,
      title: 'Smart Receipt Scanning',
      description: 'Upload receipts and let AI extract all the data automatically',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiPieChart,
      title: 'Visual Analytics',
      description: 'Beautiful charts and insights about your spending patterns',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiZap,
      title: 'AI Insights',
      description: 'Get personalized recommendations to save money and spend smarter',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiTrendingUp,
      title: 'Behavior Tracking',
      description: 'Understand your shopping habits and make better decisions',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const teamMembers = [
    {
      name: 'Francis Mutua',
      role: 'Full Stack Developer & AI Engineer',
      description: 'Built ShopSense AI as a final project for Moringa School\'s Generative AI Course. Passionate about using AI to solve everyday financial problems.',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen">

      {/* ===================== HERO SLIDER ===================== */}
      <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden -mt-24 pt-24 mb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-blue-900/40 to-transparent">
              <div className="container mx-auto px-6 h-full flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="max-w-2xl"
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-8">
                    {slides[currentSlide].description}
                  </p>
                  {/* CTA Buttons — change based on auth state */}
                  {user ? (
                    <div className="flex gap-4 flex-wrap">
                      <Link to="/upload">
                        <motion.button
                          className="glass-button-primary text-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiUpload className="inline mr-2" />
                          Upload Receipt
                        </motion.button>
                      </Link>
                      <Link to="/dashboard">
                        <motion.button
                          className="glass-button text-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiPieChart className="inline mr-2" />
                          View Dashboard
                        </motion.button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex gap-4 flex-wrap">
                      <Link to="/register">
                        <motion.button
                          className="glass-button-primary text-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Get Started Free
                        </motion.button>
                      </Link>
                      <Link to="/login">
                        <motion.button
                          className="glass-button text-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 glass-button p-3 rounded-full z-10 hover:scale-110 transition-transform">
          <FiChevronLeft className="text-2xl" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 glass-button p-3 rounded-full z-10 hover:scale-110 transition-transform">
          <FiChevronRight className="text-2xl" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6">

        {/* ===================== HEADLINE ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Track Your Shopping,
            <br />
            Master Your Spending
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-8">
            AI-powered insights to help you understand your shopping behavior
            and make smarter financial decisions
          </p>
          {!user && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register">
                <motion.button
                  className="glass-button-primary text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Free Account
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  className="glass-button text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* ===================== FEATURES ===================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to
            <span className="text-gradient"> Spend Smarter</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card p-6 text-center hover:scale-105 transition-transform"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <Icon className="text-3xl text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ===================== ABOUT US ===================== */}
        <motion.div
          id="about"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            About <span className="text-gradient">ShopSense AI</span>
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Built with passion to help everyday people take control of their finances
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/70 leading-relaxed mb-4">
                ShopSense AI was born from a simple idea — most people don't truly understand 
                where their money goes. We built this platform to bring the power of AI to 
                personal finance, making it easy for anyone to scan receipts, track spending, 
                and get intelligent insights without needing a financial advisor.
              </p>
              <p className="text-white/70 leading-relaxed">
                Whether you're trying to cut back on impulse purchases or plan your monthly 
                budget better, ShopSense AI gives you the tools and clarity to make it happen.
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                FM
              </div>
              <h3 className="text-xl font-bold mb-1">Francis Mutua</h3>
              <p className="text-purple-400 mb-3">Full Stack Developer & AI Engineer</p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Built ShopSense AI as a final project for Moringa School's Generative AI Course. 
                Passionate about using AI to solve everyday financial problems.
              </p>
              <div className="flex justify-center gap-4">
                <a href="mailto:kingoof53@gmail.com" className="text-white/60 hover:text-white transition-colors">
                  <FiMail className="text-xl" />
                </a>
                <a href="https://github.com/TechFranc" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <FiGithub className="text-xl" />
                </a>
                <a href="https://x.com/Fra_nk_lin" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <FiTwitter className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===================== CONTACT US ===================== */}
        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>

          <div className="max-w-2xl mx-auto glass-card p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Francis Mutua"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                             text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                             text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Your message here..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                             text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
              <motion.button
                className="glass-button-primary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiMail className="inline mr-2" />
                Send Message
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ===================== FLOATING BG ===================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default Home;