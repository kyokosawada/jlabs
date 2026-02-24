import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Please enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    }
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/login', {
        email: email.trim(),
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brandSection}>
          <h1 style={styles.brandTitle}>JLabs</h1>
          <p style={styles.brandSubtitle}>Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
            />
            {errors.email && (
              <span style={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
            />
            {errors.password && (
              <span style={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          {/* API Error */}
          {apiError && <div style={styles.apiError}>{apiError}</div>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    padding: '40px 36px',
  },

  /* Brand */
  brandSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brandTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#4361ee',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  brandSubtitle: {
    marginTop: '8px',
    fontSize: '15px',
    color: '#6b7280',
  },

  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 14px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#1a1a2e',
    background: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.12)',
  },

  fieldError: {
    marginTop: '4px',
    fontSize: '13px',
    color: '#ef4444',
  },

  /* API error */
  apiError: {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#991b1b',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
  },

  /* Button */
  button: {
    marginTop: '4px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#ffffff',
    background: '#4361ee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  buttonDisabled: {
    background: '#93a3f8',
    cursor: 'not-allowed',
  },
};

export default Login;
