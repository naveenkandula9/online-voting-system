import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

import { auth } from '../firebase';
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
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [firebaseVerification, setFirebaseVerification] = useState(null);
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
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.aadhaar.trim() &&
    formData.dob &&
    formData.state.trim() &&
    formData.password;

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const updateField = (event) => {
    const { name, value } = event.target;
    const numericFields = ['phone', 'aadhaar'];
    const nextValue = numericFields.includes(name) ? value.replace(/\D/g, '') : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (name === 'phone') {
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
      setConfirmationResult(null);
      setFirebaseVerification(null);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      showMessage('danger', 'Enter a valid 10-digit phone number before sending OTP.');
      return;
    }

    try {
      setLoadingAction('send-otp');
      showMessage('', '');

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' },
      );

      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = `+91${formData.phone}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpVerified(false);
      setFirebaseVerification(null);
      window.alert('OTP sent successfully to your mobile');
      showMessage('success', 'OTP sent successfully to your mobile.');
    } catch (error) {
      console.error(error);
      window.alert('Failed to send OTP');
      showMessage('danger', 'Failed to send OTP. Please check the phone number and try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showMessage('danger', 'Enter a valid 6-digit OTP.');
      return;
    }

    if (!confirmationResult) {
      showMessage('danger', 'Please send OTP before verification.');
      return;
    }

    try {
      setLoadingAction('verify-otp');
      showMessage('', '');
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();

      setOtpVerified(true);
      setFirebaseVerification({
        uid: credential.user.uid,
        phoneNumber: credential.user.phoneNumber,
        idToken,
      });
      window.alert('OTP verified successfully');
      showMessage('success', 'OTP verified. You can now complete registration.');
    } catch (error) {
      console.error(error);
      setOtpVerified(false);
      setFirebaseVerification(null);
      window.alert('Invalid OTP');
      showMessage('danger', 'Invalid OTP. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!isFormComplete || hasValidationErrors) {
      showMessage('danger', 'Please complete all fields with valid details.');
      return;
    }

    const age = calculateAge(formData.dob);

    if (age === null) {
      showMessage('danger', 'Enter a valid date of birth.');
      return;
    }

    if (age < 18) {
      window.alert(minimumAgeMessage);
      showMessage('danger', minimumAgeMessage);
      return;
    }

    if (!otpVerified) {
      showMessage('danger', 'Please verify OTP before registration.');
      return;
    }

    try {
      setLoadingAction('register');
      showMessage('', '');
      await api.post('/api/auth/register', {
        ...formData,
        firebasePhoneVerified: true,
        firebaseUid: firebaseVerification?.uid,
        firebasePhoneNumber: firebaseVerification?.phoneNumber,
        firebaseIdToken: firebaseVerification?.idToken,
      });
      showMessage('success', 'Registration successful. Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 900);
    } catch (error) {
      showMessage('danger', error.message);
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="page-header mb-4">
            <p className="text-primary fw-semibold mb-1">Voter Registration</p>
            <h1 className="h2 fw-bold">Create your secure voting account</h1>
            <p className="text-secondary mb-0">
              Verify your mobile number with OTP, then complete Aadhaar-based registration.
            </p>
          </div>

          <form className="auth-panel p-4 p-md-5" onSubmit={handleRegister} noValidate>
            <div id="recaptcha-container"></div>

            {message.text ? (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            ) : null}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="name">
                  Full name
                </label>
                <input
                  className="form-control"
                  id="name"
                  name="name"
                  onChange={updateField}
                  placeholder="Enter full name"
                  required
                  type="text"
                  value={formData.name}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  id="email"
                  name="email"
                  onChange={updateField}
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="phone">
                  Phone number
                </label>
                <div className="input-group">
                  <input
                    className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    maxLength="10"
                    name="phone"
                    onChange={updateField}
                    placeholder="10-digit mobile"
                    required
                    type="text"
                    value={formData.phone}
                  />
                  <button
                    className="btn btn-outline-primary"
                    disabled={loadingAction === 'send-otp' || !/^\d{10}$/.test(formData.phone)}
                    onClick={handleSendOtp}
                    type="button"
                  >
                    {loadingAction === 'send-otp' ? 'Sending...' : 'Send OTP'}
                  </button>
                  {validationErrors.phone ? (
                    <div className="invalid-feedback d-block">{validationErrors.phone}</div>
                  ) : null}
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="aadhaar">
                  Aadhaar number
                </label>
                <input
                  className={`form-control ${validationErrors.aadhaar ? 'is-invalid' : ''}`}
                  id="aadhaar"
                  maxLength="12"
                  name="aadhaar"
                  onChange={updateField}
                  placeholder="12-digit Aadhaar"
                  required
                  type="text"
                  value={formData.aadhaar}
                />
                {validationErrors.aadhaar ? (
                  <div className="invalid-feedback">{validationErrors.aadhaar}</div>
                ) : null}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="dob">
                  Date of Birth (Must be 18+)
                </label>
                <input
                  className={`form-control ${validationErrors.dob ? 'is-invalid' : ''}`}
                  id="dob"
                  max={new Date().toISOString().split('T')[0]}
                  name="dob"
                  onChange={updateField}
                  required
                  type="date"
                  value={formData.dob}
                />
                {validationErrors.dob ? (
                  <div className="invalid-feedback">{validationErrors.dob}</div>
                ) : null}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <select
                  className="form-control"
                  id="state"
                  name="state"
                  onChange={updateField}
                  required
                  value={formData.state}
                >
                  <option value="">Select your voting state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  onChange={updateField}
                  placeholder="Minimum 8 characters"
                  required
                  type="password"
                  value={formData.password}
                />
                {validationErrors.password ? (
                  <div className="invalid-feedback">{validationErrors.password}</div>
                ) : null}
              </div>

              {otpSent ? (
                <div className="col-12">
                  <label className="form-label" htmlFor="otp">
                    OTP
                  </label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      id="otp"
                      maxLength="6"
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      type="text"
                      value={otp}
                    />
                    <button
                      className="btn btn-success"
                      disabled={loadingAction === 'verify-otp' || !/^\d{6}$/.test(otp)}
                      onClick={handleVerifyOtp}
                      type="button"
                    >
                      {loadingAction === 'verify-otp' ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                  {otpVerified ? (
                    <div className="form-text text-success">Phone number verified successfully.</div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-primary btn-lg"
                disabled={
                  loadingAction === 'register' ||
                  !isFormComplete ||
                  hasValidationErrors ||
                  !otpVerified
                }
                type="submit"
              >
                {loadingAction === 'register' ? 'Creating account...' : 'Complete Registration'}
              </button>
            </div>

            <p className="text-secondary text-center mt-4 mb-0">
              Already registered? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Register;
