import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  aadhaar: '',
  dob: '',
  state: '',
  password: '',
};

const stateOptions = ['Andhra Pradesh', 'Telangana'];
const minimumAgeMessage = 'You must be at least 18 years old to register and vote.';

const calculateAge = (dobValue) => {
  const dob = new Date(dobValue);
  const today = new Date();

  if (!dobValue || Number.isNaN(dob.getTime()) || dob > today) {
    return null;
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const validationErrors = useMemo(() => {
    const errors = {};

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) {
      errors.aadhaar = 'Aadhaar number must be exactly 12 digits.';
    }

    if (formData.dob) {
      const age = calculateAge(formData.dob);
      if (age === null) {
        errors.dob = 'Enter a valid date of birth.';
      } else if (age < 18) {
        errors.dob = minimumAgeMessage;
      }
    }

    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    return errors;
  }, [formData]);

  const isFormComplete =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.aadhaar &&
    formData.dob &&
    formData.state &&
    formData.password;

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const updateField = (e) => {
    const { name, value } = e.target;
    const numericFields = ['phone', 'aadhaar'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? value.replace(/\D/g, '') : value,
    }));

    if (name === 'phone') {
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // SEND OTP
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      showMessage('danger', 'Enter a valid 10-digit phone number.');
      return;
    }

    try {
      setLoadingAction('send-otp');
      showMessage('', '');

      await api.post('/api/auth/send-otp', {
        phone: formData.phone,
      });

      setOtpSent(true);
      setOtpVerified(false);
      showMessage('success', 'OTP sent! Check backend console for OTP.');
    } catch (error) {
      console.error(error);
      showMessage(
        'danger',
        error.response?.data?.message || 'Failed to send OTP.'
      );
    } finally {
      setLoadingAction('');
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showMessage('danger', 'Enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoadingAction('verify-otp');
      showMessage('', '');

      await api.post('/api/auth/verify-otp', {
        phone: formData.phone,
        otp,
      });

      setOtpVerified(true);
      showMessage('success', 'OTP verified successfully.');
    } catch (error) {
      console.error(error);
      setOtpVerified(false);
      showMessage(
        'danger',
        error.response?.data?.message || 'Invalid OTP.'
      );
    } finally {
      setLoadingAction('');
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (hasValidationErrors) {
      showMessage('danger', 'Fix validation errors first.');
      return;
    }

    if (!otpVerified) {
      showMessage('danger', 'Please verify OTP first.');
      return;
    }

    try {
      setLoadingAction('register');
      showMessage('', '');

      await api.post('/api/auth/register', formData);

      showMessage('success', 'Registration successful!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      showMessage(
        'danger',
        error.response?.data?.message || error.message
      );
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <h1 className="h2 fw-bold mb-2">Voter Registration</h1>
                  <p className="text-muted">Create your secure voting account</p>
                  <small className="text-secondary">
                    Verify your mobile number with OTP, then complete Aadhaar-based registration.
                  </small>
                </div>

                {message.text && (
                  <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                    <strong>{message.type === 'success' ? '✓ ' : '✕ '}</strong>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleRegister} noValidate>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      onChange={updateField}
                      value={formData.name}
                      required
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback d-block">{validationErrors.name}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      onChange={updateField}
                      value={formData.email}
                      required
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback d-block">{validationErrors.email}</div>
                    )}
                  </div>

                  {/* Phone & OTP */}
                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label fw-semibold">
                      Phone Number
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="text"
                        className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        name="phone"
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        onChange={updateField}
                        value={formData.phone}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSendOtp}
                        disabled={loadingAction === 'send-otp' || !/^\d{10}$/.test(formData.phone)}
                      >
                        {loadingAction === 'send-otp' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                    {validationErrors.phone && (
                      <div className="invalid-feedback d-block">{validationErrors.phone}</div>
                    )}
                  </div>

                  {/* OTP Verification Section */}
                  {otpSent && (
                    <div className="mb-4 p-3 bg-light rounded border border-info">
                      <div className="mb-3">
                        <label htmlFor="otp" className="form-label fw-semibold">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="otp"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          maxLength="6"
                          required
                        />
                        <small className="text-muted d-block mt-2">
                          Check your browser console or backend logs for the OTP
                        </small>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success w-100 btn-lg"
                        onClick={handleVerifyOtp}
                        disabled={loadingAction === 'verify-otp' || !/^\d{6}$/.test(otp)}
                      >
                        {loadingAction === 'verify-otp' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Verifying...
                          </>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>

                      {otpVerified && (
                        <div className="mt-3 alert alert-success mb-0" role="alert">
                          <strong>✓ Phone Verified</strong> - You can now proceed with registration
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aadhaar */}
                  <div className="mb-4">
                    <label htmlFor="aadhaar" className="form-label fw-semibold">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${validationErrors.aadhaar ? 'is-invalid' : ''}`}
                      id="aadhaar"
                      name="aadhaar"
                      placeholder="12-digit Aadhaar number"
                      maxLength="12"
                      onChange={updateField}
                      value={formData.aadhaar}
                      required
                    />
                    {validationErrors.aadhaar && (
                      <div className="invalid-feedback d-block">{validationErrors.aadhaar}</div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-4">
                    <label htmlFor="dob" className="form-label fw-semibold">
                      Date of Birth (Must be 18+)
                    </label>
                    <input
                      type="date"
                      className={`form-control form-control-lg ${validationErrors.dob ? 'is-invalid' : ''}`}
                      id="dob"
                      name="dob"
                      max={new Date().toISOString().split('T')[0]}
                      onChange={updateField}
                      value={formData.dob}
                      required
                    />
                    {validationErrors.dob && (
                      <div className="invalid-feedback d-block">{validationErrors.dob}</div>
                    )}
                  </div>

                  {/* State */}
                  <div className="mb-4">
                    <label htmlFor="state" className="form-label fw-semibold">
                      Voting State
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="state"
                      name="state"
                      onChange={updateField}
                      value={formData.state}
                      required
                    >
                      <option value="">Select your voting state</option>
                      {stateOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div className="mb-5">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Minimum 8 characters"
                      onChange={updateField}
                      value={formData.password}
                      required
                    />
                    {validationErrors.password && (
                      <div className="invalid-feedback d-block">{validationErrors.password}</div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={
                      loadingAction === 'register' ||
                      !isFormComplete ||
                      hasValidationErrors ||
                      !otpVerified
                    }
                  >
                    {loadingAction === 'register' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating account...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Already registered?{' '}
                      <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                        Login here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;