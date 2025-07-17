import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Search, Filter, Download, Upload, Plus, Edit, Trash2, 
  Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, Clock, RefreshCw, Settings, Eye, EyeOff
} from 'lucide-react';
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

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Search and Filter Component
const SearchAndFilter = ({ onSearch, onFilter, categories, showCategoryFilter = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    onFilter(category);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {showCategoryFilter && (
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// Enhanced Dashboard Component with Charts
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
    upcoming_expenses,
    category_breakdown,
    budget_alerts,
    savings_this_month,
    spending_trends
  } = dashboardStats;

  // Prepare data for charts
  const categoryData = Object.entries(category_breakdown || {}).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount
  }));

  const trendData = (spending_trends || []).map(trend => ({
    month: trend.month,
    subscriptions: trend.subscription_spending,
    expenses: trend.expense_spending,
    total: trend.total_spending
  }));

  return (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {budget_alerts && budget_alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Budget Alerts</h3>
          </div>
          {budget_alerts.map((alert, index) => (
            <div key={index} className="text-red-700 text-sm mb-1">
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Savings Alert */}
      {savings_this_month !== undefined && (
        <div className={`border rounded-lg p-4 ${
          savings_this_month > 0 
            ? 'bg-green-50 border-green-200' 
            : savings_this_month < 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            {savings_this_month > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            ) : savings_this_month < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
            ) : (
              <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
            )}
            <span className={`font-medium ${
              savings_this_month > 0 ? 'text-green-800' : 
              savings_this_month < 0 ? 'text-red-800' : 'text-gray-800'
            }`}>
              {savings_this_month > 0 
                ? `You saved ₹${Math.abs(savings_this_month).toFixed(0)} this month!`
                : savings_this_month < 0 
                ? `You spent ₹${Math.abs(savings_this_month).toFixed(0)} more this month`
                : 'Same spending as last month'
              }
            </span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
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
              <TrendingUp className="w-6 h-6 text-green-600" />
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
              <RefreshCw className="w-6 h-6 text-purple-600" />
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
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(expense_spending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="subscriptions" stroke="#8884d8" name="Subscriptions" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
                <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Breakdown Pie Chart */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Upcoming Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Subscriptions */}
        {upcoming_subscriptions && upcoming_subscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Subscriptions</h3>
            </div>
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

        {/* Upcoming Recurring Expenses */}
        {upcoming_expenses && upcoming_expenses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Expenses</h3>
            </div>
            <div className="space-y-3">
              {upcoming_expenses.map((exp) => (
                <div key={exp.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{exp.name}</h4>
                    <p className="text-sm text-gray-600">{exp.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(exp.amount)}</p>
                    <p className="text-sm text-gray-600">Due: {formatDate(exp.next_due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      {category_breakdown && Object.keys(category_breakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Amount</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(category_breakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / total_monthly_spending) * 100;
                    return (
                      <tr key={category} className="border-t">
                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">{category}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Subscription Form Component
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

// Enhanced Expense Form Component
const ExpenseForm = ({ onSubmit, onCancel, editingExpense = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'food',
    tags: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: 'monthly'
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        name: editingExpense.name,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        tags: editingExpense.tags.join(', '),
        notes: editingExpense.notes || '',
        date: editingExpense.date.split('T')[0],
        is_recurring: editingExpense.is_recurring,
        recurring_frequency: editingExpense.recurring_frequency || 'monthly'
      });
    }
  }, [editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      date: new Date(formData.date).toISOString(),
      notes: formData.notes || null
    };
    onSubmit(submitData);
    if (!editingExpense) {
      setFormData({
        name: '',
        amount: '',
        category: 'food',
        tags: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_frequency: 'monthly'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
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
            <option value="food">Food</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="shopping">Shopping</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="groceries, monthly, essential"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Optional notes about this expense"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_recurring"
            checked={formData.is_recurring}
            onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
            This is a recurring expense
          </label>
        </div>
        {formData.is_recurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Frequency</label>
            <select
              value={formData.recurring_frequency}
              onChange={(e) => setFormData({...formData, recurring_frequency: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingExpense ? 'Update' : 'Add'} Expense
          </button>
          {editingExpense && (
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

// Budget Form Component
const BudgetForm = ({ onSubmit, onCancel, editingBudget = null }) => {
  const [formData, setFormData] = useState({
    type: 'annual',
    amount: '',
    category: '',
    period: 'monthly'
  });

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        type: editingBudget.type,
        amount: editingBudget.amount.toString(),
        category: editingBudget.category || '',
        period: editingBudget.period || 'monthly'
      });
    }
  }, [editingBudget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: formData.type === 'category' ? formData.category : null
    };
    onSubmit(submitData);
    if (!editingBudget) {
      setFormData({
        type: 'annual',
        amount: '',
        category: '',
        period: 'monthly'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingBudget ? 'Edit Budget' : 'Add New Budget'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="annual">Annual Budget</option>
            <option value="category">Category Budget</option>
          </select>
        </div>
        {formData.type === 'category' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="food">Food</option>
              <option value="transportation">Transportation</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="streaming">Streaming</option>
              <option value="software">Software</option>
              <option value="fitness">Fitness</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({...formData, period: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingBudget ? 'Update' : 'Add'} Budget
          </button>
          {editingBudget && (
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
  const [budgets, setBudgets] = useState([]);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  // Search and filter states
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseFilter, setExpenseFilter] = useState('');

  // Filtered data
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(subscriptionSearch.toLowerCase());
    const matchesFilter = !subscriptionFilter || sub.category === subscriptionFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesFilter = !expenseFilter || exp.category === expenseFilter;
    return matchesSearch && matchesFilter;
  });

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

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API}/budgets`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/suggestions`);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Export data
  const exportData = async () => {
    try {
      const response = await axios.get(`${API}/export`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nbntracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // CRUD operations for subscriptions
  const addSubscription = async (subscriptionData) => {
    try {
      await axios.post(`${API}/subscriptions`, subscriptionData);
      fetchSubscriptions();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  const updateSubscription = async (subscriptionData) => {
    try {
      await axios.put(`${API}/subscriptions/${editingSubscription.id}`, subscriptionData);
      setEditingSubscription(null);
      fetchSubscriptions();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    try {
      await axios.delete(`${API}/subscriptions/${subscriptionId}`);
      fetchSubscriptions();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // CRUD operations for expenses
  const addExpense = async (expenseData) => {
    try {
      await axios.post(`${API}/expenses`, expenseData);
      fetchExpenses();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (expenseData) => {
    try {
      await axios.put(`${API}/expenses/${editingExpense.id}`, expenseData);
      setEditingExpense(null);
      fetchExpenses();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await axios.delete(`${API}/expenses/${expenseId}`);
      fetchExpenses();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // CRUD operations for budgets
  const addBudget = async (budgetData) => {
    try {
      await axios.post(`${API}/budgets`, budgetData);
      fetchBudgets();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const updateBudget = async (budgetData) => {
    try {
      await axios.put(`${API}/budgets/${editingBudget.id}`, budgetData);
      setEditingBudget(null);
      fetchBudgets();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await axios.delete(`${API}/budgets/${budgetId}`);
      fetchBudgets();
      fetchDashboardStats();
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchSubscriptions(),
        fetchExpenses(),
        fetchBudgets(),
        fetchSuggestions()
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
                onClick={exportData}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => {
                  fetchDashboardStats();
                  fetchSubscriptions();
                  fetchExpenses();
                  fetchBudgets();
                  fetchSuggestions();
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
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

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">Smart Suggestions</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="text-blue-700 text-sm">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

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
                  
                  <SearchAndFilter
                    onSearch={setSubscriptionSearch}
                    onFilter={setSubscriptionFilter}
                    categories={['streaming', 'software', 'utilities', 'fitness', 'news', 'productivity', 'entertainment', 'other']}
                  />
                  
                  <div className="space-y-3">
                    {filteredSubscriptions.map((sub) => (
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
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSubscription(sub.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="space-y-6">
              <ExpenseForm
                onSubmit={editingExpense ? updateExpense : addExpense}
                onCancel={() => setEditingExpense(null)}
                editingExpense={editingExpense}
              />
              
              {expenses.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Expenses</h3>
                  
                  <SearchAndFilter
                    onSearch={setExpenseSearch}
                    onFilter={setExpenseFilter}
                    categories={['food', 'transportation', 'entertainment', 'utilities', 'shopping', 'healthcare', 'education', 'other']}
                  />
                  
                  <div className="space-y-3">
                    {filteredExpenses.map((exp) => (
                      <div key={exp.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{exp.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="capitalize">{exp.category}</span>
                            {exp.is_recurring && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                Recurring
                              </span>
                            )}
                          </div>
                          {exp.tags && exp.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exp.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {exp.notes && (
                            <p className="text-sm text-gray-500 mt-1">{exp.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(exp.amount)}</p>
                            <p className="text-sm text-gray-600">{formatDate(exp.date)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingExpense(exp)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {currentView === 'budgets' && (
            <div className="space-y-6">
              <BudgetForm
                onSubmit={editingBudget ? updateBudget : addBudget}
                onCancel={() => setEditingBudget(null)}
                editingBudget={editingBudget}
              />
              
              {budgets.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Budgets</h3>
                  <div className="space-y-3">
                    {budgets.map((budget) => (
                      <div key={budget.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {budget.type === 'annual' ? 'Annual Budget' : `${budget.category} Budget`}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(budget.amount)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingBudget(budget)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBudget(budget.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </main>
      </div>
    </div>
  );
}

export default App;