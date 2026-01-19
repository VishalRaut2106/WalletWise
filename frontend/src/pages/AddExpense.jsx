// src/components/AddExpense.jsx
import React, { useState } from 'react';
import './AddExpense.css';

const AddExpense = ({ isOpen, onClose, onAddExpense }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: ''
  });

  // Expense Categories Only
  const expenseCategories = [
    { value: 'food', label: 'Food & Dining', icon: '🍕' },
    { value: 'transport', label: 'Transportation', icon: '🚌' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'healthcare', label: 'Health & Fitness', icon: '💊' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'card', label: 'Debit/Credit Card', icon: '💳' },
    { value: 'online', label: 'Online', icon: '🏦' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const transactionData = {
      type: 'expense', // Fixed as expense
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description || '',
      paymentMethod: formData.paymentMethod,
      date: formData.date
    };

    console.log('Sending expense data:', transactionData);
    onAddExpense(transactionData);
    onClose();
    
    // Reset form
    setFormData({
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
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
        <div className="expense-modal-header expense-header">
          <div className="header-left">
            <i className="fas fa-receipt"></i>
            <h2>Add Expense 💸</h2>
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
              {expenseCategories.map(category => (
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

          {/* Payment Method */}
          <div className="expense-form-group">
            <label>
              <i className="fas fa-credit-card"></i> Payment Method
            </label>
            <div className="payment-method-grid">
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  type="button"
                  className={`payment-btn ${formData.paymentMethod === method.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                >
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-label">{method.label}</span>
                </button>
              ))}
            </div>
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
              placeholder="What was this expense for? e.g., Lunch with friends, Uber ride, etc."
              rows="3"
            />
          </div>

          {/* Form Actions */}
          <div className="expense-form-actions">
            <button type="button" className="expense-btn-cancel" onClick={onClose}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button type="submit" className="expense-btn-submit expense-btn">
              <i className="fas fa-plus-circle"></i> Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;