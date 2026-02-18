import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiHeart, FiPieChart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="glass-card rounded-none border-0 border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FiPieChart className="text-xl text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient">ShopSense AI</span>
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                Track Smart, Spend Smarter
              </p>
              <p className="text-white/50 text-sm">
                AI-powered shopping behavior tracker that helps you understand your spending patterns and make smarter financial decisions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="text-white/70 hover:text-white transition-colors">
                    Upload Receipt
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/insights" className="text-white/70 hover:text-white transition-colors">
                    AI Insights
                  </Link>
                </li>
                <li>
                  <Link to="/receipts" className="text-white/70 hover:text-white transition-colors">
                    Receipts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:kingoof53@gmail.com" 
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <FiMail className="text-lg" />
                  <span className="text-sm">kingoof53@gmail.com</span>
                </a>
                
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://github.com/TechFranc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                    title="GitHub"
                  >
                    <FiGithub className="text-lg" />
                  </a>
                  <a
                    href="https://x.com/Fra_nk_lin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                    title="Twitter/X"
                  >
                    <FiTwitter className="text-lg" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} ShopSense AI. Built by{' '}
              <a 
                href="https://github.com/TechFranc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors font-semibold"
              >
                Francis Mutua
              </a>
            </p>
            <p className="text-white/50 text-sm flex items-center gap-1">
              Made with <FiHeart className="text-red-400 animate-pulse" /> for Moringa School
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;