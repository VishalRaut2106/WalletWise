// src/pages/SetBudget.jsx
import React, { useState, useEffect } from 'react';
import './SetBudget.css';

const SetBudget = ({ isOpen, onClose, currentBudget = 2500, onSetBudget }) => {
  const [formData, setFormData] = useState({
    totalBudget: currentBudget,
    categories: [
      { name: 'Food', amount: 0, percentage: 0, color: '#FF6B6B' },
      { name: 'Transport', amount: 0, percentage: 0, color: '#4ECDC4' },
      { name: 'Entertainment', amount: 0, percentage: 0, color: '#FFD166' },
      { name: 'Shopping', amount: 0, percentage: 0, color: '#06D6A0' },
      { name: 'Education', amount: 0, percentage: 0, color: '#118AB2' },
      { name: 'Other', amount: 0, percentage: 0, color: '#7209B7' }
    ]
  });

  const [activeCategory, setActiveCategory] = useState(0);

  // Initialize percentages based on total budget
  useEffect(() => {
    const total = formData.totalBudget;
    if (total > 0) {
      const updatedCategories = formData.categories.map(cat => ({
        ...cat,
        amount: Math.round((cat.percentage / 100) * total),
        amountStr: Math.round((cat.percentage / 100) * total).toString()
      }));
      setFormData(prev => ({ ...prev, categories: updatedCategories }));
    }
  }, [formData.totalBudget]);

  const handleTotalBudgetChange = (e) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      totalBudget: numValue,
      categories: prev.categories.map(cat => ({
        ...cat,
        amount: Math.round((cat.percentage / 100) * numValue),
        amountStr: Math.round((cat.percentage / 100) * numValue).toString()
      }))
    }));
  };

  const handleCategoryPercentageChange = (index, value) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    const maxValue = 100;
    const clampedValue = Math.min(Math.max(numValue, 0), maxValue);
    
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      percentage: clampedValue,
      amount: Math.round((clampedValue / 100) * formData.totalBudget),
      amountStr: Math.round((clampedValue / 100) * formData.totalBudget).toString()
    };
    
    // Recalculate other categories to maintain total of 100%
    const totalPercentage = updatedCategories.reduce((sum, cat) => sum + cat.percentage, 0);
    if (totalPercentage > 100) {
      // Adjust other categories proportionally
      const otherCategories = updatedCategories.filter((_, i) => i !== index);
      const totalOtherPercentage = otherCategories.reduce((sum, cat) => sum + cat.percentage, 0);
      const remainingPercentage = 100 - clampedValue;
      
      if (totalOtherPercentage > 0) {
        otherCategories.forEach((cat, i) => {
          const originalIndex = updatedCategories.findIndex(c => c.name === cat.name);
          const newPercentage = Math.round((cat.percentage / totalOtherPercentage) * remainingPercentage);
          updatedCategories[originalIndex] = {
            ...updatedCategories[originalIndex],
            percentage: newPercentage,
            amount: Math.round((newPercentage / 100) * formData.totalBudget),
            amountStr: Math.round((newPercentage / 100) * formData.totalBudget).toString()
          };
        });
      }
    }
    
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleCategoryAmountChange = (index, value) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    const maxAmount = formData.totalBudget;
    const clampedValue = Math.min(Math.max(numValue, 0), maxAmount);
    
    const percentage = formData.totalBudget > 0 
      ? Math.round((clampedValue / formData.totalBudget) * 100)
      : 0;
    
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      amount: clampedValue,
      percentage: percentage,
      amountStr: clampedValue.toString()
    };
    
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleQuickAllocation = (type) => {
    const allocations = {
      'student': [30, 20, 15, 10, 15, 10], // Food, Transport, Entertainment, Shopping, Education, Other
      'balanced': [25, 15, 10, 15, 20, 15],
      'saver': [40, 25, 5, 5, 20, 5]
    };
    
    const percentages = allocations[type] || allocations['balanced'];
    const updatedCategories = formData.categories.map((cat, index) => ({
      ...cat,
      percentage: percentages[index],
      amount: Math.round((percentages[index] / 100) * formData.totalBudget),
      amountStr: Math.round((percentages[index] / 100) * formData.totalBudget).toString()
    }));
    
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.totalBudget <= 0) {
      alert('Please enter a valid total budget amount');
      return;
    }

    const totalPercentage = formData.categories.reduce((sum, cat) => sum + cat.percentage, 0);
    if (totalPercentage !== 100) {
      alert(`Total percentage must be 100%. Currently it's ${totalPercentage}%`);
      return;
    }

    const budgetData = {
      totalBudget: formData.totalBudget,
      categories: formData.categories.map(cat => ({
        name: cat.name,
        amount: cat.amount,
        percentage: cat.percentage
      }))
    };

    onSetBudget(budgetData);
    onClose();
    
    alert(`Budget set successfully! Total: ₹${formData.totalBudget.toLocaleString()}`);
  };

  if (!isOpen) return null;

  const totalAllocated = formData.categories.reduce((sum, cat) => sum + cat.percentage, 0);
  const remainingPercentage = 100 - totalAllocated;

  return (
    <div className="budget-modal-overlay">
      <div className="budget-modal-content">
        <div className="budget-modal-header">
          <div className="header-left">
            <i className="fas fa-bullseye"></i>
            <h2>Set Monthly Budget 🎯</h2>
          </div>
          <button className="close-budget-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Total Budget */}
          <div className="budget-form-group">
            <label htmlFor="totalBudget">
              <i className="fas fa-wallet"></i> Total Monthly Budget *
            </label>
            <div className="total-budget-input">
              <span className="budget-currency">₹</span>
              <input
                type="number"
                id="totalBudget"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleTotalBudgetChange}
                placeholder="0"
                min="0"
                required
                autoFocus
              />
            </div>
            <p className="budget-hint">Enter your total monthly budget amount</p>
          </div>

          {/* Quick Allocation Buttons */}
          <div className="budget-form-group">
            <label>
              <i className="fas fa-bolt"></i> Quick Allocation Templates
            </label>
            <div className="quick-allocation-buttons">
              <button 
                type="button" 
                className="allocation-btn student"
                onClick={() => handleQuickAllocation('student')}
              >
                <i className="fas fa-graduation-cap"></i> Student
              </button>
              <button 
                type="button" 
                className="allocation-btn balanced"
                onClick={() => handleQuickAllocation('balanced')}
              >
                <i className="fas fa-balance-scale"></i> Balanced
              </button>
              <button 
                type="button" 
                className="allocation-btn saver"
                onClick={() => handleQuickAllocation('saver')}
              >
                <i className="fas fa-piggy-bank"></i> Saver
              </button>
            </div>
          </div>

          {/* Category Budgets */}
          <div className="budget-form-group">
            <label>
              <i className="fas fa-chart-pie"></i> Category-wise Allocation *
            </label>
            
            <div className="category-tabs">
              {formData.categories.map((category, index) => (
                <button
                  key={category.name}
                  type="button"
                  className={`category-tab ${activeCategory === index ? 'active' : ''}`}
                  onClick={() => setActiveCategory(index)}
                  style={{ borderLeftColor: category.color }}
                >
                  <span className="tab-name">{category.name}</span>
                  <span className="tab-percentage">{category.percentage}%</span>
                </button>
              ))}
            </div>

            {/* Active Category Editor */}
            <div className="active-category-editor">
              <div className="category-header" style={{ backgroundColor: formData.categories[activeCategory].color + '20' }}>
                <div className="category-color" style={{ backgroundColor: formData.categories[activeCategory].color }}></div>
                <h3>{formData.categories[activeCategory].name}</h3>
                <div className="category-stats">
                  <span className="stat-percentage">{formData.categories[activeCategory].percentage}%</span>
                  <span className="stat-amount">₹{formData.categories[activeCategory].amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="category-controls">
                {/* Percentage Slider */}
                <div className="control-group">
                  <label>Percentage Allocation</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.categories[activeCategory].percentage}
                      onChange={(e) => handleCategoryPercentageChange(activeCategory, e.target.value)}
                      className="percentage-slider"
                      style={{ '--track-color': formData.categories[activeCategory].color }}
                    />
                    <div className="slider-value">
                      <span>{formData.categories[activeCategory].percentage}%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.categories[activeCategory].percentage}
                        onChange={(e) => handleCategoryPercentageChange(activeCategory, e.target.value)}
                        className="percentage-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="control-group">
                  <label>Amount (₹)</label>
                  <div className="amount-input-container">
                    <span className="amount-currency">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={formData.totalBudget}
                      value={formData.categories[activeCategory].amountStr || formData.categories[activeCategory].amount}
                      onChange={(e) => handleCategoryAmountChange(activeCategory, e.target.value)}
                      className="amount-input"
                    />
                    <span className="amount-hint">
                      Max: ₹{formData.totalBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocation Summary */}
            <div className="allocation-summary">
              <div className="summary-item">
                <span className="summary-label">Total Allocated:</span>
                <span className={`summary-value ${totalAllocated === 100 ? 'valid' : 'invalid'}`}>
                  {totalAllocated}%
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Remaining:</span>
                <span className={`summary-value ${remainingPercentage === 0 ? 'valid' : 'warning'}`}>
                  {remainingPercentage}%
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value amount">
                  ₹{formData.totalBudget.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pie Chart Preview */}
            <div className="pie-chart-preview">
              <div className="pie-chart" style={{ width: '120px', height: '120px' }}>
                {formData.categories.map((category, index) => {
                  if (category.percentage === 0) return null;
                  
                  const total = formData.categories.reduce((sum, cat) => sum + cat.percentage, 0);
                  const percentage = (category.percentage / total) * 100;
                  const rotation = formData.categories.slice(0, index).reduce((sum, cat) => {
                    const p = (cat.percentage / total) * 100;
                    return sum + (p * 3.6);
                  }, 0);
                  
                  return (
                    <div 
                      key={category.name}
                      className="pie-segment"
                      style={{
                        backgroundColor: category.color,
                        transform: `rotate(${rotation}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${percentage >= 50 ? '100%' : '50%'} 0%, 100% 100%, 100% 100%, 50% 50%)`
                      }}
                      title={`${category.name}: ${category.percentage}% (₹${category.amount.toLocaleString()})`}
                    ></div>
                  );
                })}
              </div>
              <div className="pie-legend">
                {formData.categories.map(category => (
                  <div key={category.name} className="legend-item">
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="legend-label">{category.name}</span>
                    <span className="legend-percentage">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="budget-form-actions">
            <button type="button" className="budget-btn-cancel" onClick={onClose}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button 
              type="submit" 
              className="budget-btn-submit"
              disabled={totalAllocated !== 100 || formData.totalBudget <= 0}
            >
              <i className="fas fa-check-circle"></i> Set Budget
            </button>
          </div>

          {/* Budget Tips */}
          <div className="budget-tips">
            <h4><i className="fas fa-lightbulb"></i> Budgeting Tips</h4>
            <ul>
              <li>✅ Allocate 50-60% of your budget to needs (Food, Transport, Bills)</li>
              <li>✅ Reserve 20-30% for wants (Entertainment, Shopping)</li>
              <li>✅ Save at least 10-20% of your income</li>
              <li>✅ Review and adjust your budget monthly</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBudget;