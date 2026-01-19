// src/components/Homepage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const smoothScroll = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && window.innerWidth <= 768) {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(card);
    });
    
    // Observe stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(stat => {
      stat.style.opacity = '0';
      stat.style.transform = 'translateY(20px)';
      stat.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(stat);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <i className="fas fa-wallet"></i>
              WalletWise
            </div>
            
            {/* Desktop Navigation */}
            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <a onClick={() => smoothScroll('features')}>Features</a>
              <a onClick={() => smoothScroll('why')}>Why Students Love</a>
              <a onClick={() => smoothScroll('stats')}>Results</a>
              <a onClick={() => smoothScroll('cta')}>Get Started</a>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Money Made Simple for Students 💸</h1>
              <p>WalletWise helps you track, save, and grow — without stress. Designed specifically for college life with a friendly interface that makes finance fun.</p>
              <div className="hero-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  <i className="fas fa-graduation-cap"></i>
                  Start as Student
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => smoothScroll('features')}
                >
                  <i className="fas fa-chart-bar"></i>
                  See How It Works
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <h3>WalletWise</h3>
                  <p>Track your coffee, textbooks, and nights out all in one place!</p>
                  <i className="fas fa-pizza-slice"></i>
                  <p>Your money, made simple.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Everything You Need to Master Your Money</h2>
            <p>WalletWise gives you the tools to take control of your finances with features designed for student life.</p>
          </div>
          <div className="feature-cards">
            {[
              {
                icon: 'fas fa-pizza-slice',
                title: 'Track Daily Expenses',
                desc: 'Log coffee runs, snacks, and nights out with just a tap. Categorize your spending to see where your money goes.'
              },
              {
                icon: 'fas fa-calendar-alt',
                title: 'Monthly Budget Planner',
                desc: 'Plan your month with a simple budget that adjusts to your student lifestyle. Set limits for food, fun, and essentials.'
              },
              {
                icon: 'fas fa-bell',
                title: 'Overspending Alerts',
                desc: 'Get friendly notifications when you\'re nearing your budget limits. No surprises at the end of the month!'
              },
              {
                icon: 'fas fa-lightbulb',
                title: 'Smart Spending Insights',
                desc: 'Learn how to save more with personalized tips based on your spending habits. Become a money pro!'
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Love Section */}
      <section className="why-love" id="why">
        <div className="container">
          <div className="why-content">
            <div className="why-text">
              <h2>Why Students Love WalletWise</h2>
              <p>We built WalletWise specifically for the student experience, eliminating the complexity of traditional finance apps.</p>
              <ul className="benefits-list">
                {[
                  'Simple UI - No confusing menus or complex charts',
                  'No Complex Finance Terms - Plain language you actually understand',
                  'Works Perfectly on Mobile - Designed for your phone, not a desktop',
                  'Student-Focused Categories - Textbooks, coffee, campus meals, and more'
                ].map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <span><strong>{benefit.split(' - ')[0]}</strong> - {benefit.split(' - ')[1]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="why-image">
              <div className="students-img">
                <i className="fas fa-users"></i>
                <h3>Join 50,000+ Students</h3>
                <p>Who are already mastering their money with WalletWise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" id="stats">
        <div className="container">
          <div className="stats-content">
            {[
              { icon: 'fas fa-chart-line', number: '95%', text: 'Users Saved More Money' },
              { icon: 'fas fa-clock', number: '10+ Hours', text: 'Saved Per Month' },
              { icon: 'fas fa-star', number: '4.8/5', text: 'User Rating' }
            ].map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-text">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Start Your Money Journey Today</h2>
            <p>Join thousands of students who are already taking control of their finances with WalletWise. It's free, simple, and made just for you.</p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-graduation-cap"></i>
                Start as Student - It's Free
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => smoothScroll('features')}
              >
                <i className="fas fa-play-circle"></i>
                Watch Demo Video
              </button>
            </div>
            <p className="disclaimer">No credit card required. Student email verification.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>WalletWise</h3>
              <p>Money management made simple for students. Track, save, and grow without the stress.</p>
              <div className="social-icons">
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-tiktok"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
              </div>
            </div>
            <div className="footer-column">
              <h3>Features</h3>
              <a onClick={() => smoothScroll('features')}>Expense Tracking</a>
              <a onClick={() => smoothScroll('features')}>Budget Planning</a>
              <a onClick={() => smoothScroll('features')}>Spending Alerts</a>
              <a onClick={() => smoothScroll('features')}>Smart Insights</a>
            </div>
            <div className="footer-column">
              <h3>For Students</h3>
              <a href="#">College Budgeting Guide</a>
              <a href="#">Student Discounts</a>
              <a href="#">Financial Literacy Tips</a>
              <a href="#">Campus Partnerships</a>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="copyright">
            &copy; 2023 WalletWise. All rights reserved. Made with ❤️ for students everywhere.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;