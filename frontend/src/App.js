import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Utility function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Dashboard Component
const Dashboard = ({ dashboardStats, onRefresh }) => {
  if (!dashboardStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    total_monthly_spending,
    total_yearly_spending,
    yearly_projection,
    subscription_spending,
    expense_spending,
    upcoming_subscriptions,
    category_breakdown,
    budget_alerts
  } = dashboardStats;

  return (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {budget_alerts && budget_alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Budget Alerts</h3>
          {budget_alerts.map((alert, index) => (
            <div key={index} className="text-red-700 text-sm mb-1">
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(total_monthly_spending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Yearly Projection</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(yearly_projection)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(subscription_spending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(expense_spending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Subscriptions */}
      {upcoming_subscriptions && upcoming_subscriptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Subscriptions (Next 7 Days)</h3>
          <div className="space-y-3">
            {upcoming_subscriptions.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{sub.name}</h4>
                  <p className="text-sm text-gray-600">{sub.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(sub.cost)}</p>
                  <p className="text-sm text-gray-600">Due: {formatDate(sub.next_due_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {category_breakdown && Object.keys(category_breakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(category_breakdown).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{category}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subscription Form Component
const SubscriptionForm = ({ onSubmit, onCancel, editingSubscription = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billing_frequency: 'monthly',
    next_due_date: '',
    category: 'streaming'
  });

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name,
        cost: editingSubscription.cost.toString(),
        billing_frequency: editingSubscription.billing_frequency,
        next_due_date: editingSubscription.next_due_date.split('T')[0],
        category: editingSubscription.category
      });
    }
  }, [editingSubscription]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      cost: parseFloat(formData.cost),
      next_due_date: new Date(formData.next_due_date).toISOString()
    };
    onSubmit(submitData);
    if (!editingSubscription) {
      setFormData({
        name: '',
        cost: '',
        billing_frequency: 'monthly',
        next_due_date: '',
        category: 'streaming'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Frequency</label>
          <select
            value={formData.billing_frequency}
            onChange={(e) => setFormData({...formData, billing_frequency: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
          <input
            type="date"
            value={formData.next_due_date}
            onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="streaming">Streaming</option>
            <option value="software">Software</option>
            <option value="utilities">Utilities</option>
            <option value="fitness">Fitness</option>
            <option value="news">News</option>
            <option value="productivity">Productivity</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingSubscription ? 'Update' : 'Add'} Subscription
          </button>
          {editingSubscription && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Add subscription
  const addSubscription = async (subscriptionData) => {
    try {
      await axios.post(`${API}/subscriptions`, subscriptionData);
      fetchSubscriptions();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  // Update subscription
  const updateSubscription = async (subscriptionData) => {
    try {
      await axios.put(`${API}/subscriptions/${editingSubscription.id}`, subscriptionData);
      setEditingSubscription(null);
      fetchSubscriptions();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Delete subscription
  const deleteSubscription = async (subscriptionId) => {
    try {
      await axios.delete(`${API}/subscriptions/${subscriptionId}`);
      fetchSubscriptions();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchSubscriptions(),
        fetchExpenses()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '🔄' },
    { id: 'expenses', name: 'Expenses', icon: '💰' },
    { id: 'budgets', name: 'Budgets', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NBNTracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NBNTracker</h1>
              <span className="ml-2 text-sm text-gray-500">Subscription & Expense Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  fetchDashboardStats();
                  fetchSubscriptions();
                  fetchExpenses();
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {currentView === 'dashboard' && (
            <Dashboard 
              dashboardStats={dashboardStats} 
              onRefresh={fetchDashboardStats}
            />
          )}

          {currentView === 'subscriptions' && (
            <div className="space-y-6">
              <SubscriptionForm
                onSubmit={editingSubscription ? updateSubscription : addSubscription}
                onCancel={() => setEditingSubscription(null)}
                editingSubscription={editingSubscription}
              />
              
              {subscriptions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subscriptions</h3>
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{sub.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{sub.category} • {sub.billing_frequency}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(sub.cost)}</p>
                            <p className="text-sm text-gray-600">Due: {formatDate(sub.next_due_date)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingSubscription(sub)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSubscription(sub.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'expenses' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Tracking</h3>
              <p className="text-gray-600">Expense management coming soon...</p>
            </div>
          )}

          {currentView === 'budgets' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Management</h3>
              <p className="text-gray-600">Budget management coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;