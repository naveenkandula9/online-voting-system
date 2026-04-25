import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const redirectPath = location.state?.from?.pathname || '/vote';

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.identifier.trim() || !formData.password) {
      setMessage({ type: 'danger', text: 'Please enter your email/phone and password.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await api.post('/api/auth/login', {
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      localStorage.setItem('votingToken', response.data.token);
      localStorage.setItem('votingUser', JSON.stringify(response.data.user));

      setMessage({ type: 'success', text: 'Login successful. Redirecting...' });

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } catch (error) {
      localStorage.removeItem('votingToken');
      localStorage.removeItem('votingUser');
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="page-header mb-4">
            <p className="text-primary fw-semibold mb-1">Secure Login</p>
            <h1 className="h2 fw-bold">Access your voting account</h1>
            <p className="text-secondary mb-0">
              Use your registered email or phone number. Only OTP-verified users can login.
            </p>
          </div>

          <form className="auth-panel p-4 p-md-5" onSubmit={handleLogin} noValidate>
            {message.text ? (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            ) : null}

            <div className="mb-3">
              <label className="form-label" htmlFor="identifier">
                Email or phone
              </label>
              <input
                autoComplete="username"
                className="form-control"
                disabled={loading}
                id="identifier"
                name="identifier"
                onChange={updateField}
                placeholder="name@example.com or 9876543210"
                required
                type="text"
                value={formData.identifier}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="form-control"
                disabled={loading}
                id="password"
                name="password"
                onChange={updateField}
                placeholder="Enter password"
                required
                type="password"
                value={formData.password}
              />
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg"
                disabled={loading || !formData.identifier.trim() || !formData.password}
                type="submit"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <p className="text-secondary text-center mt-4 mb-0">
              New voter? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
