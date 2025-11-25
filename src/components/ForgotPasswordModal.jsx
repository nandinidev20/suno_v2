import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } = useAuth();

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

  const validateEmail = () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return false;
    }
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const result = await sendForgotPasswordOtp(formData.email);
      if (result.success) {
        setStep(2);
        setErrors({});
      }
    } catch (error) {
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setLoading(true);
    try {
      const result = await verifyForgotPasswordOtp(formData.email, formData.otp);
      if (result.success) {
        setStep(3);
        setErrors({});
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
      if (result.success) {
        setStep(4);
        setErrors({});
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 16, background: '#181c2a', color: '#fff', border: '1.5px solid #23263a', boxShadow: '0 8px 32px #0008' }}>
          <div className="modal-header border-0" style={{ background: 'transparent' }}>
            <h5 className="modal-title" style={{ color: '#a78bfa', fontWeight: 700, letterSpacing: 1 }}>
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Enter OTP'}
              {step === 3 && 'Reset Password'}
              {step === 4 && 'Success'}
            </h5>
            {step !== 4 && (
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClose} style={{ filter: 'invert(1)' }}></button>
            )}
          </div>
          <div className="modal-body">
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="mb-3">
                  <label htmlFor="forgot-email" className="form-label" style={{ color: '#fff', fontWeight: 500 }}>
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    className="form-control"
                    style={{
                      background: '#23263a',
                      color: '#fff',
                      border: '1.5px solid #23263a',
                      borderRadius: 10,
                      padding: '12px'
                    }}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    autoFocus
                  />
                  {errors.email && (
                    <div className="text-danger mt-2" style={{ fontSize: '0.875rem' }}>
                      {errors.email}
                    </div>
                  )}
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      padding: '12px',
                      fontWeight: 600
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-3">
                  <label htmlFor="forgot-otp" className="form-label" style={{ color: '#fff', fontWeight: 500 }}>
                    Enter OTP (check your email inbox & spam folder)
                  </label>
                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    className="form-control"
                    style={{
                      background: '#23263a',
                      color: '#fff',
                      border: '1.5px solid #23263a',
                      borderRadius: 10,
                      padding: '12px',
                      fontSize: '1.2rem',
                      letterSpacing: '4px',
                      textAlign: 'center'
                    }}
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="000000"
                    maxLength="6"
                    required
                    autoFocus
                  />
                  {errors.otp && (
                    <div className="text-danger mt-2" style={{ fontSize: '0.875rem' }}>
                      {errors.otp}
                    </div>
                  )}
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      padding: '12px',
                      fontWeight: 600
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: '1px solid #23263a',
                      borderRadius: 10,
                      color: '#fff',
                      padding: '12px'
                    }}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label htmlFor="new-password" className="form-label" style={{ color: '#fff', fontWeight: 500 }}>
                    New Password
                  </label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    className="form-control"
                    style={{
                      background: '#23263a',
                      color: '#fff',
                      border: '1.5px solid #23263a',
                      borderRadius: 10,
                      padding: '12px'
                    }}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    required
                    autoFocus
                  />
                  {errors.newPassword && (
                    <div className="text-danger mt-2" style={{ fontSize: '0.875rem' }}>
                      {errors.newPassword}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="confirm-password" className="form-label" style={{ color: '#fff', fontWeight: 500 }}>
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    style={{
                      background: '#23263a',
                      color: '#fff',
                      border: '1.5px solid #23263a',
                      borderRadius: 10,
                      padding: '12px'
                    }}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="text-danger mt-2" style={{ fontSize: '0.875rem' }}>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      padding: '12px',
                      fontWeight: 600
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: '1px solid #23263a',
                      borderRadius: 10,
                      color: '#fff',
                      padding: '12px'
                    }}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="text-center py-4">
                <div className="mb-4">
                  <i className="fa fa-check-circle" style={{ fontSize: '4rem', color: '#28a745' }}></i>
                </div>
                <h5 style={{ color: '#fff', marginBottom: '1rem' }}>Password Reset Successful!</h5>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                  Your password has been changed successfully. You can now login with your new password.
                </p>
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                  style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    padding: '12px 30px',
                    fontWeight: 600
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

