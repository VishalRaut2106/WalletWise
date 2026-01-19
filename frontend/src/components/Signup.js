import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaUniversity, FaGraduationCap, FaPhone } from 'react-icons/fa';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    department: '',
    year: '1st'
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!studentId.trim()) {
      toast.error('Student ID is required');
      return;
    }
    
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the full backend URL
      const API_URL = 'http://localhost:5000/api/auth/register';
      
      const response = await axios.post(
        API_URL,
        {
          name: fullName,
          email: email.toLowerCase().trim(),
          password: password,
          studentId: studentId.trim(),
          phoneNumber: phoneNumber.trim(),
          department: department.trim(),
          year: year
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        // Store complete user data
        localStorage.setItem('userInfo', JSON.stringify({
          ...response.data.user,
          token: response.data.token
        }));
        
        toast.success('Registration successful! Redirecting...');
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        console.error(`Server error ${status}:`, data);
        
        if (status === 400) {
          errorMessage = data.message || 'Please check your input fields';
        } else if (status === 409) {
          errorMessage = 'User already exists. Please login instead.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server. Is backend running?');
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000';
      } else {
        // Other errors
        console.error('Error:', error.message);
        if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Check your connection and CORS settings.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const years = ['1st', '2nd', '3rd', '4th', '5th'];
  
  const {
    studentId,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    department,
    year
  } = formData;

  return (
    <div className="auth-container">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="auth-card">
        <div className="auth-header">
          <h1>WalletWise</h1>
          <p className="subtitle">Student Registration</p>
          <p className="backend-status">
            Backend: <span className="status-indicator">http://localhost:5000</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* ... rest of your form JSX remains the same ... */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId">
                <FaIdCard className="input-icon" />
                Student ID *
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={studentId}
                onChange={handleChange}
                placeholder="Enter your student ID"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="fullName">
                <FaUser className="input-icon" />
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Password * (min 6 chars)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">
                <FaPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="year">
                <FaGraduationCap className="input-icon" />
                Year *
              </label>
              <select
                id="year"
                name="year"
                value={year}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="department">
              <FaUniversity className="input-icon" />
              Department *
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              required
              disabled={loading}
            />
          </div>
          
          <div className="terms-agreement">
            <label>
              <input type="checkbox" required disabled={loading} />
              I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? 
            <Link to="/login" className="auth-link"> Login</Link>
          </p>
          <p className="debug-info">
            Backend: http://localhost:5000
          </p>
        </div>
      </div>
      
      <div className="auth-features">
        <h3>Student Benefits</h3>
        <ul>
          <li>🎓 Free for students</li>
          <li>💰 Budget tracking tools</li>
          <li>📈 Financial insights</li>
          <li>🔔 Smart notifications</li>
          <li>📊 Expense reports</li>
        </ul>
      </div>
    </div>
  );
};

export default Signup;