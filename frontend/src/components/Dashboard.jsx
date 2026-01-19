// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css';
import AddExpense from '../pages/AddExpense';
import SetBudget from '../pages/SetBudget';
import SavingGoal from '../pages/SavingGoal';
import { 
  FaWallet, FaSignOutAlt, FaUserCircle, FaBell, FaChevronDown,
  FaMoneyBillWave, FaChartLine, FaPiggyBank, FaPlusCircle,
  FaHandHoldingUsd, FaBullseye, FaChartBar, FaDownload,
  FaExclamationTriangle, FaUtensils, FaCar, FaShoppingBag,
  FaHome, FaGamepad, FaBook, FaBriefcaseMedical
} from 'react-icons/fa';

// Category icons mapping
const categoryIcons = {
  food: <FaUtensils />,
  transport: <FaCar />,
  shopping: <FaShoppingBag />,
  entertainment: <FaGamepad />,
  education: <FaBook />,
  healthcare: <FaBriefcaseMedical />,
  housing: <FaHome />,
  other: <FaMoneyBillWave />
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const navigate = useNavigate();

  // Modal states
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');

  // Real data states
  const [stats, setStats] = useState({
    totalBalance: 0,
    spentThisMonth: 0,
    incomeThisMonth: 0,
    budgetLeft: 0,
    savings: 0,
    monthlyBudget: 0,
    budgetUsedPercentage: 0
  });

  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [weeklyExpenses, setWeeklyExpenses] = useState([]);

  // ============ AUTH & DATA FETCHING ============
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo || !userInfo.token) {
          navigate('/login');
          return;
        }

        setUser(userInfo);
        const token = userInfo.token;

        // Set time greeting
        const hour = new Date().getHours();
        if (hour < 12) setTimeOfDay('Morning');
        else if (hour < 17) setTimeOfDay('Afternoon');
        else setTimeOfDay('Evening');

        setCurrentMonth(new Date().toLocaleString('default', { month: 'long' }));

        // Fetch ALL dashboard data from backend
        await fetchDashboardData(token);

      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError('Failed to initialize dashboard. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Function to fetch all dashboard data
  const fetchDashboardData = async (token) => {
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Fetch dashboard summary (we'll create this endpoint)
      const dashboardRes = await axios.get('http://localhost:5000/api/dashboard/summary', config);
      const dashboardData = dashboardRes.data;

      if (dashboardData.success) {
        // Update stats
        setStats({
          totalBalance: dashboardData.totalBalance || 0,
          spentThisMonth: dashboardData.monthlyExpenses || 0,
          incomeThisMonth: dashboardData.monthlyIncome || 0,
          budgetLeft: dashboardData.budgetLeft || 0,
          savings: dashboardData.totalSavings || 0,
          monthlyBudget: dashboardData.monthlyBudget || 0,
          budgetUsedPercentage: dashboardData.budgetUsedPercentage || 0
        });

        // Update recent transactions
        setRecentTransactions(dashboardData.recentTransactions || []);

        // Update category spending
        setCategorySpending(dashboardData.categorySpending || []);

        // Update weekly expenses
        setWeeklyExpenses(dashboardData.weeklyExpenses || []);

        // Update savings goals
        setSavingsGoals(dashboardData.savingsGoals || []);

        // Update notifications count
        setNotifications(dashboardData.notifications || 0);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  };

  // ============ HANDLERS ============
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const openExpenseModal = () => {
    setTransactionType('expense');
    setShowAddTransactionModal(true);
  };

  const openIncomeModal = () => {
    setTransactionType('income');
    setShowAddTransactionModal(true);
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/transactions',
        transactionData,
        config
      );

      if (response.data.success) {
        setShowAddTransactionModal(false);
        // Refresh dashboard data
        await fetchDashboardData(user.token);
      } else {
        alert(response.data.message || 'Failed to add transaction');
      }

    } catch (err) {
      console.error('Transaction error:', err);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleSetBudget = async (budgetData) => {
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/budget',
        budgetData,
        config
      );

      if (response.data.success) {
        setShowSetBudgetModal(false);
        await fetchDashboardData(user.token);
      } else {
        alert(response.data.message || 'Failed to set budget');
      }

    } catch (err) {
      console.error('Budget error:', err);
      alert('Failed to set budget. Please try again.');
    }
  };

  const handleSetSavingsGoal = async (goalData) => {
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/savings',
        goalData,
        config
      );

      if (response.data.success) {
        setShowSavingsGoalModal(false);
        await fetchDashboardData(user.token);
      } else {
        alert(response.data.message || 'Failed to create savings goal');
      }

    } catch (err) {
      console.error('Savings goal error:', err);
      alert('Failed to create savings goal. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryKey = category.toLowerCase();
    return categoryIcons[categoryKey] || categoryIcons.other;
  };

  // ============ RENDERING ============
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const hasTransactions = recentTransactions.length > 0;
  const hasSavingsGoals = savingsGoals.length > 0;
  const hasBudget = stats.monthlyBudget > 0;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>WalletWise</h1>
          <span className="welcome-text">
            Good {timeOfDay}, {user?.fullName || user?.name}!
          </span>
          <span className="month-text">{currentMonth} Overview</span>
        </div>
        
        <div className="header-right">
          <button className="notification-btn">
            <FaBell />
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
          </button>
          
          <div className="user-dropdown">
            <button className="user-btn">
              <FaUserCircle size={24} />
              <span>{user?.fullName || user?.name}</span>
              <FaChevronDown />
            </button>
            <div className="dropdown-menu">
              <button onClick={() => navigate('/profile')}>Profile</button>
              <button onClick={() => navigate('/settings')}>Settings</button>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card balance-card">
            <div className="stat-icon">
              <FaWallet />
            </div>
            <div className="stat-info">
              <h3>Current Balance</h3>
              <p className="stat-value">{formatCurrency(stats.totalBalance)}</p>
              <p className="stat-subtitle">
                {stats.incomeThisMonth > 0 
                  ? `₹${stats.incomeThisMonth} income this month` 
                  : 'No income recorded this month'}
              </p>
            </div>
          </div>

          <div className="stat-card expense-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-info">
              <h3>Monthly Spending</h3>
              <p className="stat-value">{formatCurrency(stats.spentThisMonth)}</p>
              {hasBudget ? (
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(stats.budgetUsedPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="budget-text">
                    {formatCurrency(stats.budgetLeft)} left of {formatCurrency(stats.monthlyBudget)}
                  </p>
                </div>
              ) : (
                <p className="stat-subtitle">No budget set yet</p>
              )}
            </div>
          </div>

          <div className="stat-card savings-card">
            <div className="stat-icon">
              <FaPiggyBank />
            </div>
            <div className="stat-info">
              <h3>Total Savings</h3>
              <p className="stat-value">{formatCurrency(stats.savings)}</p>
              <p className="stat-subtitle">
                {hasSavingsGoals 
                  ? `${savingsGoals.length} active goal${savingsGoals.length > 1 ? 's' : ''}`
                  : 'No savings goals yet'}
              </p>
            </div>
          </div>

          <div className="stat-card quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button onClick={openExpenseModal} className="action-btn expense-btn">
                <FaPlusCircle /> Add Expense
              </button>
              <button onClick={openIncomeModal} className="action-btn income-btn">
                <FaHandHoldingUsd /> Add Income
              </button>
              <button onClick={() => setShowSetBudgetModal(true)} className="action-btn budget-btn">
                <FaChartLine /> Set Budget
              </button>
              <button onClick={() => setShowSavingsGoalModal(true)} className="action-btn goal-btn">
                <FaBullseye /> New Goal
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content-grid">
          {/* Left Column - Transactions & Analytics */}
          <div className="left-column">
            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Transactions</h3>
                <button 
                  onClick={() => navigate('/transactions')}
                  className="view-all-btn"
                >
                  View All
                </button>
              </div>
              
              {hasTransactions ? (
                <div className="transactions-list">
                  {recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-icon">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="transaction-details">
                        <h4>{transaction.description}</h4>
                        <p className="transaction-category">{transaction.category}</p>
                        <p className="transaction-date">{formatDate(transaction.date)}</p>
                      </div>
                      <div className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No transactions yet. Add your first expense or income!</p>
                  <button onClick={openExpenseModal} className="btn-primary">
                    Add Transaction
                  </button>
                </div>
              )}
            </div>

            {/* Category Spending */}
            <div className="card">
              <div className="card-header">
                <h3>Spending by Category</h3>
              </div>
              {categorySpending.length > 0 ? (
                <div className="category-list">
                  {categorySpending.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className="category-icon">
                          {getCategoryIcon(category.name)}
                        </span>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <div className="category-amount">
                        {formatCurrency(category.amount)}
                        <span className="category-percentage">
                          ({((category.amount / stats.spentThisMonth) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No spending data available for this month.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Goals & Weekly Overview */}
          <div className="right-column">
            {/* Savings Goals */}
            <div className="card">
              <div className="card-header">
                <h3>Savings Goals</h3>
                <button 
                  onClick={() => setShowSavingsGoalModal(true)}
                  className="add-btn"
                >
                  <FaPlusCircle /> Add Goal
                </button>
              </div>
              
              {hasSavingsGoals ? (
                <div className="goals-list">
                  {savingsGoals.slice(0, 3).map((goal, index) => (
                    <div key={index} className="goal-item">
                      <div className="goal-info">
                        <h4>{goal.name}</h4>
                        <p className="goal-target">
                          Target: {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                          ></div>
                        </div>
                        <p className="goal-current">
                          {formatCurrency(goal.currentAmount)} saved
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No savings goals yet. Start saving for your dreams!</p>
                  <button 
                    onClick={() => setShowSavingsGoalModal(true)}
                    className="btn-primary"
                  >
                    Create Goal
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Expense Chart */}
            <div className="card">
              <div className="card-header">
                <h3>Weekly Spending</h3>
              </div>
              {weeklyExpenses.length > 0 ? (
                <div className="weekly-chart">
                  <div className="chart-bars">
                    {weeklyExpenses.map((day, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-label">{day.day}</div>
                        <div className="chart-bar">
                          <div 
                            className="chart-bar-fill"
                            style={{ 
                              height: `${(day.amount / Math.max(...weeklyExpenses.map(d => d.amount))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="chart-bar-amount">
                          {formatCurrency(day.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No spending data for this week.</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="card tips-card">
              <h3>💡 Financial Tips</h3>
              <ul className="tips-list">
                <li>Track every expense, no matter how small</li>
                <li>Set realistic monthly budgets</li>
                <li>Create emergency savings fund</li>
                <li>Review your spending weekly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddExpense
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onAddExpense={handleAddTransaction}
        transactionType={transactionType}
      />

      <SetBudget
        isOpen={showSetBudgetModal}
        onClose={() => setShowSetBudgetModal(false)}
        onSetBudget={handleSetBudget}
        currentSpending={categorySpending}
      />

      <SavingGoal
        isOpen={showSavingsGoalModal}
        onClose={() => setShowSavingsGoalModal(false)}
        onSetGoal={handleSetSavingsGoal}
        currentSavings={stats.savings}
      />
    </div>
  );
};

export default Dashboard;