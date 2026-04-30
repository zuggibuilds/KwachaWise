import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Smartphone, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignIn = () => {
    if (user) {
      navigate('/app/');
    } else {
      navigate('/login');
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/app/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-slate-900">KwachaWise</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition">Benefits</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">How it Works</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSignIn}
              className="hidden sm:block text-slate-600 hover:text-slate-900 font-medium transition"
            >
              {user ? 'Dashboard' : 'Sign in'}
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              ✨ New: AI-Powered Insights
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Smart Money <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Management
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 mb-8 leading-relaxed"
            >
              Take control of your finances with intelligent budgeting, expense tracking, and financial goals tailored for your lifestyle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Try for free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2"
              >
                <span>{user ? 'Open App' : 'See demo'}</span>
                <span>→</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <p className="text-sm text-slate-600 mt-1">Active Users</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-slate-900">100M+</div>
                <p className="text-sm text-slate-600 mt-1">Transactions Tracked</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl h-64 flex items-center justify-center mb-6">
                <BarChart3 className="w-24 h-24 text-white opacity-80" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Take Control</h3>
              <p className="text-slate-600">
                Visualize your spending patterns and make smarter financial decisions with real-time insights.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600">Everything you need to manage your money effectively</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-2xl border border-blue-200/50"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Analytics</h3>
              <p className="text-slate-600">
                Understand your spending with detailed charts and insights about your financial habits.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 p-8 rounded-2xl border border-green-200/50"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Budget Planning</h3>
              <p className="text-slate-600">
                Set and monitor budgets for different categories to stay within your spending goals.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-8 rounded-2xl border border-purple-200/50"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mobile First</h3>
              <p className="text-slate-600">
                Track expenses on the go with our intuitive mobile app. Sync across all devices seamlessly.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 rounded-2xl border border-orange-200/50"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Assistant</h3>
              <p className="text-slate-600">
                Get personalized recommendations and smart insights powered by artificial intelligence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose KwachaWise?</h2>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Easy to Use</h3>
                    <p className="text-slate-600 mt-1">Intuitive interface that gets you up and running in minutes.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Secure & Private</h3>
                    <p className="text-slate-600 mt-1">Bank-level security protects your financial data 24/7.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Always Synced</h3>
                    <p className="text-slate-600 mt-1">Your data updates instantly across all your devices.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Local Focus</h3>
                    <p className="text-slate-600 mt-1">Built for your local currency and financial context.</p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                viewport={{ once: true }}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                Start Free Trial
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl h-96 flex items-center justify-center"
            >
              <div className="text-center">
                <TrendingUp className="w-24 h-24 text-slate-400 mx-auto mb-4 opacity-60" />
                <p className="text-slate-600 font-medium">See your financial progress visually</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing / How it Works Section */}
      <section id="pricing" className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-600">Choose what works best for you</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-600 mb-6">Start tracking your finances</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">$0<span className="text-lg text-slate-600">/mo</span></div>
              <button className="w-full border border-slate-300 text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 transition mb-6">
                Get Started
              </button>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Expense tracking</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Basic reports</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Mobile app access</span>
                </li>
              </ul>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -15 }}
              viewport={{ once: true }}
              className="border-2 border-blue-600 rounded-2xl p-8 transform scale-105 shadow-xl relative"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-600 mb-6">Advanced budgeting & insights</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">$4.99<span className="text-lg text-slate-600">/mo</span></div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition mb-6"
              >
                Try Free
              </motion.button>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Everything in Free</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Advanced budgeting</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">AI recommendations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Priority support</span>
                </li>
              </ul>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Business</h3>
              <p className="text-slate-600 mb-6">For teams & organizations</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">Custom<span className="text-lg text-slate-600">/mo</span></div>
              <button className="w-full border border-slate-300 text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 transition mb-6">
                Contact Us
              </button>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Everything in Pro</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Team management</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">API access</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-slate-600">Dedicated support</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Take Control?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of people managing their finances smarter with KwachaWise.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
            >
              Start Your Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignIn}
              className="border-2 border-slate-300 hover:border-slate-400 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg transition"
            >
              {user ? 'Go to Dashboard' : 'Sign In'}
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-bold">KwachaWise</span>
              </div>
              <p className="text-slate-400 text-sm">Smart money management for everyone.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 KwachaWise. All rights reserved.</p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
