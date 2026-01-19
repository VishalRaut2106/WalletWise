// src/components/AddIncome.jsx
import React, { useState } from 'react';
import './AddExpense.css'; // Reuse the same CSS

const AddIncome = ({ isOpen, onClose, onAddIncome }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'pocket_money',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Income Categories Only
  const incomeCategories = [
    { value: 'pocket_money', label: 'Pocket Money', icon: '👛' },
    { value: 'internship', label: 'Internship', icon: '💼' },
    { value: 'scholarship', label: 'Scholarship', icon: '🎓' },
    { value: 'freelancing', label: 'Freelancing', icon: '💻' },
    { value: 'part_time_job', label: 'Part-time Job', icon: '🏢' },
    { value: 'gift', label: 'Gift', icon: '🎁' },
    { value: 'investment', label: 'Investment Returns', icon: '📈' },
    { value: 'other', label: 'Other Income', icon: '💰' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const transactionData = {
      type: 'income', // Fixed as income
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description || '',
      paymentMethod: 'cash', // Default for income
      date: formData.date
    };

    console.log('Sending income data:', transactionData);
    onAddIncome(transactionData);
    onClose();
    
    // Reset form
    setFormData({
      amount: '',
      category: 'pocket_money',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryClick = (categoryValue) => {
    setFormData(prev => ({
      ...prev,
      category: categoryValue
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <div className="expense-modal-header income-header">
          <div className="header-left">
            <i className="fas fa-hand-holding-dollar"></i>
            <h2>Add Income 💰</h2>
          </div>
          <button className="close-expense-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="expense-form-group">
            <label htmlFor="amount">
              <i className="fas fa-rupee-sign"></i> Amount *
            </label>
            <div className="expense-amount-input">
              <span className="expense-currency">₹</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="expense-form-group">
            <label>
              <i className="fas fa-tags"></i> Category *
            </label>
            <div className="category-grid">
              {incomeCategories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  className={`category-btn ${formData.category === category.value ? 'selected' : ''}`}
                  onClick={() => handleCategoryClick(category.value)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Field */}
          <div className="expense-form-group">
            <label htmlFor="date">
              <i className="fas fa-calendar-day"></i> Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="expense-form-group">
            <label htmlFor="description">
              <i className="fas fa-sticky-note"></i> Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional notes about this income..."
              rows="3"
            />
          </div>

          {/* Form Actions */}
          <div className="expense-form-actions">
            <button type="button" className="expense-btn-cancel" onClick={onClose}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button type="submit" className="expense-btn-submit income-btn">
              <i className="fas fa-hand-holding-dollar"></i> Add Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncome;