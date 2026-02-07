'use client'

import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-white">SkyConnect SL</span>
            </div>
            <p className="mb-6 text-gray-400">
              Your trusted platform for authentic Sri Lankan experiences. 
              Connecting travelers with verified local service providers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center 
                                   justify-center hover:bg-primary-blue transition-colors">
                <FiFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center 
                                   justify-center hover:bg-primary-blue transition-colors">
                <FiInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center 
                                   justify-center hover:bg-primary-blue transition-colors">
                <FiTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center 
                                   justify-center hover:bg-primary-blue transition-colors">
                <FiLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'How It Works', 'Destinations', 'Blog', 'Careers', 'Press Kit'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary-teal transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">For Partners</h3>
            <ul className="space-y-3">
              {[
                'Become a Partner',
                'Partner Login',
                'Partner Resources',
                'Success Stories',
                'FAQs',
                'Support Center',
              ].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary-teal transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary-teal flex-shrink-0 mt-1" />
                <span>123 Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-teal flex-shrink-0" />
                <a href="tel:+94112345678" className="hover:text-primary-teal transition-colors">
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-teal flex-shrink-0" />
                <a href="mailto:hello@skyconnect.lk" className="hover:text-primary-teal transition-colors">
                  hello@skyconnect.lk
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 
                           text-sm focus:outline-none focus:border-primary-teal"
                />
                <button className="bg-gradient-primary text-white px-4 py-2 rounded-lg 
                                 hover:shadow-lg transition-all">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 SkyConnect SL. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-primary-teal transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary-teal transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary-teal transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
