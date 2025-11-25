import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    if (passwordStrength.score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="nav">
            <Link to="/"><h1 className="logo"><img src="/img/logo.png" alt="TRIBA" /></h1></Link>
            <div className="nav-buttons">
              <Link to="/login" className="btn-fill btn-sign">Sign In</Link>
              <Link to="/register" className="btn-outline btn-sign">Sign Up</Link>
            </div>
          </div>
          
          <div className="hero-content" style={{ marginTop: "5%" }}>
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-10">
                <div className="text-center mb-2">
                  <h2 className="display-8 fw-bold text-white mb-2">Create your account</h2>
                  <p className="lead text-white-50">Start creating amazing AI-generated music today</p>
                </div>
                
                <div className="card border-0 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '25px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="card-body p-2">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label text-white fw-semibold text-uppercase small">
                          Email address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="Enter your email"
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '15px',
                            color: '#fff',
                          }}
                        />
                        {errors.email && (
                          <div className="invalid-feedback d-block text-danger mt-2">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            {errors.email}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label text-white fw-semibold text-uppercase small">
                          Password
                        </label>
                        <div className="position-relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Create a strong password"
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: '2px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '15px',
                              color: '#fff',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-3 text-white-50"
                            style={{ border: 'none', background: 'none' }}
                          >
                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.password && (
                          <div className="invalid-feedback d-block text-danger mt-2">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            {errors.password}
                          </div>
                        )}
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-3">
                            <div className="d-flex gap-1 mb-2">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`flex-fill ${level <= passwordStrength.score ? 
                                    passwordStrength.score <= 2 ? 'bg-danger' : 
                                    passwordStrength.score <= 3 ? 'bg-warning' : 'bg-success' 
                                    : 'bg-secondary'} rounded`}
                                  style={{ height: '4px' }}
                                />
                              ))}
                            </div>
                            <small className={`fw-semibold ${
                              passwordStrength.score <= 2 ? 'text-danger' : 
                              passwordStrength.score <= 3 ? 'text-warning' : 'text-success'
                            }`}>
                              {getPasswordStrengthText()}
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label text-white fw-semibold text-uppercase small">
                          Confirm Password
                        </label>
                        <div className="position-relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Confirm your password"
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: '2px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '15px',
                              color: '#fff',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-3 text-white-50"
                            style={{ border: 'none', background: 'none' }}
                          >
                            <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback d-block text-danger mt-2">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>

                      <div className="d-grid mb-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-lg fw-bold text-uppercase"
                          style={{
                            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                            border: 'none',
                            borderRadius: '15px',
                            color: '#fff',
                            letterSpacing: '1px',
                            fontSize: '16px'
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating account...
                            </>
                          ) : (
                            'Create account'
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="text-center">
                      <p className="text-white-50 mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#ff6b6b' }}>
                          Sign in instead
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Register;