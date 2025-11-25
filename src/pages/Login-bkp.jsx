import React, { Fragment, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp:''
  });
  const [showOTP,setShowOTP] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login ,sendOtp} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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

    if(!showOTP)
    {
       try {
          const result = await sendOtp(formData.email, formData.password);
          if (result.success) {
           setShowOTP(true)
          }
        } catch (error) {
          console.error('OTP error:', error);
        } finally {
          setLoading(false);
        }
    }
    else{
        try {
          const result = await login(formData.email, formData.password,formData.otp);
          if (result.success) {
            navigate(from, { replace: true });
            //window.location.reload(); 
          }
        } catch (error) {
          console.error('Login error:', error);
        } finally {
          setLoading(false);
        }
    }
  };

  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="nav">
            <Link to="/"> <h1 className="logo"><img src="/img/logo.png" alt="TRIBA" /></h1></Link>
            <div className="nav-buttons">
              <Link to="/login" className="btn-fill btn-sign">Sign In</Link>
              <Link to="/register" className="btn-outline btn-sign">Sign Up</Link>
            </div>
          </div>
          <div className="hero-content" style={{ marginTop: "5%" }}>
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-10">
                <div className="text-center mb-2">
                  <h2 className="display-8 fw-bold text-white mb-2">Welcome back</h2>
                  <p className="lead text-white-50">Sign in to your account to continue creating music</p>
                </div>
                
                <div className="card border-0 shadow-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '25px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="card-body p-2">
                    <form onSubmit={handleSubmit}>
                      {!showOTP &&
                      <Fragment>
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
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter your password"
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
                      </div>
                      </Fragment> }

                      {showOTP &&

                         <div className="mb-4">
                        <label htmlFor="otp" className="form-label text-white fw-semibold text-uppercase small">
                          OTP (check your email inbox & spam folder)
                        </label>
                        <input
                          id="otp"
                          name="otp"
                          required
                          value={formData.otp}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="Enter the OTP"
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '15px',
                            color: '#fff',
                          }}
                        />
                        {errors.otp && (
                          <div className="invalid-feedback d-block text-danger mt-2">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            {errors.otp}
                          </div>
                        )}
                      </div>
                      }

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
                              Signing in...
                            </>
                          ) : (
                            'Sign in'
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="text-center">
                      <p className="text-white-50 mb-0">
                        New to AI Music?{' '}
                        <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: '#ff6b6b' }}>
                          Create an account
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

export default Login; 