import { Link } from 'react-router-dom';
import { Coins, PieChart, Shield, Wallet, ArrowRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Landing() {
  useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Coins className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold">Prospero</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Master Your Money,
          <br />
          <span className="text-blue-600 dark:text-blue-400">Shape Your Future</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Take control of your financial journey with Prospero. Smart budgeting, intuitive tracking,
          and powerful insights all in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Start Free <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="px-8 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Prospero?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 dark:bg-gray-700 rounded-xl">
              <Wallet className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Budgeting</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage budgets effortlessly. Stay on track with intelligent alerts and recommendations.
              </p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-gray-700 rounded-xl">
              <PieChart className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Understand your spending patterns with beautiful, interactive charts and reports.
              </p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-gray-700 rounded-xl">
              <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your financial data is protected with the highest level of encryption and security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$10B+</div>
              <div className="text-blue-100">Transactions Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Take Control?</h2>
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold">Prospero</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Prospero. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}