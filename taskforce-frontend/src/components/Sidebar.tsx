import { useState } from 'react';
import { Coins, Home, PieChart, Settings, Wallet, Receipt, Target, Menu, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Wallet },
  { name: 'Reports', href: '/dashboard/reports', icon: PieChart },
  { name: 'Budgets', href: '/dashboard/budgets', icon: Target },
  { name: 'Categories', href: '/dashboard/categories', icon: Receipt },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth();

  return (
    <div
      className={clsx(
        'flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-soft-xl',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <button
          title="Toggle Sidebar"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        {isOpen && (
          <Link to="/dashboard" className="flex items-center space-x-2 ml-2 animate-fade-in">
            <Coins className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Prospero
            </span>
          </Link>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-inner-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'animate-bounce-slow')} />
              {isOpen && <span className="ml-3 animate-slide-in">{item.name}</span>}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-inner-lg"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="ml-3 animate-slide-in">Logout</span>}
        </button>
      </nav>
    </div>
  );
}