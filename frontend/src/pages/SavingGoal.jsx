// src/components/SavingsGoal.jsx
import React, { useState, useEffect } from 'react';
import './SavingGoal.css';

const SavingsGoal = ({ isOpen, onClose, currentSavings = 0, onSetGoal }) => {
  const [formData, setFormData] = useState({
    goalName: 'New Phone',
    targetAmount: 25000,
    targetDate: '',
    currentAmount: currentSavings,
    priority: 'medium',
    recurring: false,
    monthlyContribution: 1000
  });

  const [timeline, setTimeline] = useState(6); // months

  // Set default target date to 6 months from now
  useEffect(() => {
    const today = new Date();
    const futureDate = new Date(today.setMonth(today.getMonth() + timeline));
    const formattedDate = futureDate.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      targetDate: formattedDate
    }));
  }, [timeline]);

  useEffect(() => {
    // Recalculate monthly contribution when target amount or timeline changes
    const months = timeline;
    const monthly = Math.ceil(formData.targetAmount / months);
    
    setFormData(prev => ({
      ...prev,
      monthlyContribution: monthly
    }));
  }, [formData.targetAmount, timeline]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTargetAmountChange = (e) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setFormData(prev => ({ ...prev, targetAmount: numValue }));
  };

  const handleMonthlyContributionChange = (e) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setFormData(prev => ({ ...prev, monthlyContribution: numValue }));
  };

  const handleTimelineChange = (months) => {
    setTimeline(months);
    // Recalculate monthly contribution
    const monthly = Math.ceil(formData.targetAmount / months);
    setFormData(prev => ({ ...prev, monthlyContribution: monthly }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.targetAmount <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    if (formData.targetAmount <= formData.currentAmount) {
      alert('Target amount should be greater than current savings');
      return;
    }

    const goalData = {
      ...formData,
      timeline,
      progress: Math.round((formData.currentAmount / formData.targetAmount) * 100),
      remainingAmount: formData.targetAmount - formData.currentAmount,
      monthlyRequired: formData.monthlyContribution
    };

    onSetGoal(goalData);
    onClose();
    
    alert(`Savings goal "${formData.goalName}" created successfully!`);
  };

  const calculateProgress = () => {
    return Math.min(Math.round((formData.currentAmount / formData.targetAmount) * 100), 100);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4ECDC4',
      'medium': '#FFD166',
      'high': '#FF6B6B'
    };
    return colors[priority] || '#FFD166';
  };

  if (!isOpen) return null;

  const progress = calculateProgress();
  const remainingAmount = formData.targetAmount - formData.currentAmount;
  const monthlyNeeded = Math.ceil(remainingAmount / timeline);

  return (
    <div className="savings-modal-overlay">
      <div className="savings-modal-content">
        <div className="savings-modal-header">
          <div className="header-left">
            <i className="fas fa-piggy-bank"></i>
            <h2>Create Savings Goal 🎯</h2>
          </div>
          <button className="close-savings-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Goal Name */}
          <div className="savings-form-group">
            <label htmlFor="goalName">
              <i className="fas fa-bullseye"></i> Goal Name *
            </label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              placeholder="e.g., New Laptop, Vacation, Emergency Fund"
              required
              autoFocus
            />
          </div>

          {/* Target Amount & Current Savings */}
          <div className="amounts-grid">
            <div className="savings-form-group">
              <label htmlFor="targetAmount">
                <i className="fas fa-flag-checkered"></i> Target Amount *
              </label>
              <div className="amount-input">
                <span className="amount-currency">₹</span>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleTargetAmountChange}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="savings-form-group">
              <label htmlFor="currentAmount">
                <i className="fas fa-wallet"></i> Current Savings
              </label>
              <div className="amount-input">
                <span className="amount-currency">₹</span>
                <input
                  type="number"
                  id="currentAmount"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max={formData.targetAmount}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="savings-form-group">
            <label>Progress</label>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span className="progress-text">
                  ₹{formData.currentAmount.toLocaleString()} / ₹{formData.targetAmount.toLocaleString()}
                </span>
                <span className="progress-percentage">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Timeline Selection */}
          <div className="savings-form-group">
            <label>
              <i className="fas fa-calendar-alt"></i> Timeline
            </label>
            <div className="timeline-buttons">
              {[3, 6, 9, 12, 18, 24].map(months => (
                <button
                  key={months}
                  type="button"
                  className={`timeline-btn ${timeline === months ? 'active' : ''}`}
                  onClick={() => handleTimelineChange(months)}
                >
                  {months} months
                </button>
              ))}
            </div>
            <p className="savings-hint">
              Target Date: {new Date(formData.targetDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Monthly Contribution */}
          <div className="savings-form-group">
            <label htmlFor="monthlyContribution">
              <i className="fas fa-calendar-check"></i> Monthly Contribution
            </label>
            <div className="amount-input">
              <span className="amount-currency">₹</span>
              <input
                type="number"
                id="monthlyContribution"
                name="monthlyContribution"
                value={formData.monthlyContribution}
                onChange={handleMonthlyContributionChange}
                placeholder="0"
                min="1"
              />
            </div>
            <p className="savings-hint">
              You need to save ₹{monthlyNeeded.toLocaleString()} per month to reach your goal
            </p>
          </div>

          {/* Priority Selection */}
          <div className="savings-form-group">
            <label htmlFor="priority">
              <i className="fas fa-exclamation-circle"></i> Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Recurring Option */}
          <div className="savings-form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
              />
              <i className="fas fa-redo"></i> Set as recurring goal (auto-reset after completion)
            </label>
          </div>

          {/* Summary Card */}
          <div className="summary-card">
            <h4><i className="fas fa-chart-line"></i> Goal Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Goal</span>
                <span className="summary-value">🎯 {formData.goalName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Target</span>
                <span className="summary-value">₹{formData.targetAmount.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Timeline</span>
                <span className="summary-value">{timeline} months</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Monthly</span>
                <span className="summary-value">₹{monthlyNeeded.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Priority</span>
                <span 
                  className="summary-value priority-badge"
                  style={{ backgroundColor: getPriorityColor(formData.priority) }}
                >
                  {formData.priority}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Remaining</span>
                <span className="summary-value remaining">₹{remainingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="savings-form-actions">
            <button type="button" className="savings-btn-cancel" onClick={onClose}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button 
              type="submit" 
              className="savings-btn-submit"
              disabled={formData.targetAmount <= 0 || formData.targetAmount <= formData.currentAmount}
            >
              <i className="fas fa-check-circle"></i> Create Goal
            </button>
          </div>

          {/* Savings Tips */}
          <div className="savings-tips">
            <h4><i className="fas fa-lightbulb"></i> Savings Tips</h4>
            <ul>
              <li>✅ Start with an emergency fund of 3-6 months of expenses</li>
              <li>✅ Automate your savings with monthly transfers</li>
              <li>✅ Review and adjust your goals quarterly</li>
              <li>✅ Celebrate small milestones to stay motivated</li>
              <li>✅ Consider high-yield savings accounts for better returns</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoal;