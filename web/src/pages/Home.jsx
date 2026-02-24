import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

const GEO_FIELDS = [
  { key: 'ip', label: 'IP Address' },
  { key: 'hostname', label: 'Hostname' },
  { key: 'city', label: 'City' },
  { key: 'region', label: 'Region' },
  { key: 'country', label: 'Country' },
  { key: 'loc', label: 'Coordinates' },
  { key: 'org', label: 'Organization' },
  { key: 'postal', label: 'Postal Code' },
  { key: 'timezone', label: 'Timezone' },
];

function loadHistory() {
  try {
    const raw = localStorage.getItem('searchHistory');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

function Home() {
  const navigate = useNavigate();

  const [ownGeo, setOwnGeo] = useState(null);
  const [currentGeo, setCurrentGeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIp, setSearchIp] = useState('');
  const [validationError, setValidationError] = useState('');
  const [searchHistory, setSearchHistory] = useState(loadHistory);
  const [isSearchResult, setIsSearchResult] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const fetchGeo = useCallback(async (ip) => {
    const url = ip
      ? `https://ipinfo.io/${ip}/geo`
      : 'https://ipinfo.io/geo';
    const { data } = await axios.get(url);
    return data;
  }, []);

  // Fetch user's own IP info on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchGeo();
        if (!cancelled) {
          setOwnGeo(data);
          setCurrentGeo(data);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.error?.message ||
            err.message ||
            'Failed to fetch your IP geolocation.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchGeo]);

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = searchIp.trim();
    setValidationError('');
    setError('');

    if (!trimmed) {
      setValidationError('Please enter an IP address.');
      return;
    }
    if (!IPV4_REGEX.test(trimmed)) {
      setValidationError(
        'Invalid IPv4 format. Expected format: 123.45.67.89'
      );
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const data = await fetchGeo(trimmed);
        setCurrentGeo(data);
        setIsSearchResult(true);

        // Add to history
        const entry = {
          ip: data.ip || trimmed,
          city: data.city || '-',
          region: data.region || '-',
          country: data.country || '-',
          timestamp: new Date().toISOString(),
        };
        const updated = [entry, ...searchHistory].slice(0, 50);
        setSearchHistory(updated);
        saveHistory(updated);
      } catch (err) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch geolocation for that IP.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }

  function handleClear() {
    setSearchIp('');
    setValidationError('');
    setError('');
    setIsSearchResult(false);
    if (ownGeo) {
      setCurrentGeo(ownGeo);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function formatTimestamp(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.headerTitle}>JLabs</h1>
          <div style={styles.headerRight}>
            <span style={styles.userName}>
              {user.name || 'User'}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Search bar */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>IP Geolocation Lookup</h2>
            <form onSubmit={handleSearch} style={styles.searchRow}>
              <input
                type="text"
                value={searchIp}
                onChange={(e) => {
                  setSearchIp(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Enter an IPv4 address (e.g. 8.8.8.8)"
                style={{
                  ...styles.input,
                  ...(validationError ? styles.inputError : {}),
                  flex: 1,
                }}
              />
              <button type="submit" disabled={loading} style={styles.searchBtn}>
                {loading && isSearchResult ? 'Searching...' : 'Search'}
              </button>
              {isSearchResult && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={styles.clearBtn}
                >
                  Clear
                </button>
              )}
            </form>
            {validationError && (
              <p style={styles.fieldError}>{validationError}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBanner}>{error}</div>
          )}

          {/* Loading */}
          {loading && !currentGeo && (
            <div style={styles.loadingCard}>
              <div style={styles.spinner} />
              <span style={{ marginLeft: 12, color: '#6b7280' }}>
                Loading geolocation data...
              </span>
            </div>
          )}

          {/* Geo info card */}
          {currentGeo && !loading && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                {isSearchResult
                  ? `Results for ${currentGeo.ip || searchIp}`
                  : 'Your IP Geolocation'}
              </h2>
              <div style={styles.geoGrid}>
                {GEO_FIELDS.map(({ key, label }) => {
                  const value = currentGeo[key];
                  if (!value) return null;
                  return (
                    <div key={key} style={styles.geoRow}>
                      <span style={styles.geoLabel}>{label}</span>
                      <span style={styles.geoValue}>{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search history */}
          {searchHistory.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Search History</h2>
              <div style={styles.historyList}>
                {searchHistory.map((entry, idx) => (
                  <div
                    key={`${entry.ip}-${entry.timestamp}-${idx}`}
                    style={styles.historyItem}
                  >
                    <div style={styles.historyMain}>
                      <span style={styles.historyIp}>{entry.ip}</span>
                      <span style={styles.historyLocation}>
                        {[entry.city, entry.region, entry.country]
                          .filter((v) => v && v !== '-')
                          .join(', ') || '-'}
                      </span>
                    </div>
                    <span style={styles.historyTime}>
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Spinner keyframes injected via style tag */}
      <style>{`
        @keyframes jlabs-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  /* Header */
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#4361ee',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  logoutBtn: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#4361ee',
    background: 'transparent',
    border: '1px solid #4361ee',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },

  /* Main */
  main: {
    padding: '32px 24px 64px',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  /* Card */
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    padding: '28px 32px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 20px 0',
  },

  /* Search */
  searchRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px 14px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    color: '#1a1a2e',
    background: '#f9fafb',
    minWidth: '200px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.12)',
  },
  searchBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    background: '#4361ee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  clearBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#6b7280',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  fieldError: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '13px',
    color: '#ef4444',
  },

  /* Error banner */
  errorBanner: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#991b1b',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
  },

  /* Loading */
  loadingCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#4361ee',
    borderRadius: '50%',
    animation: 'jlabs-spin 0.7s linear infinite',
  },

  /* Geo grid */
  geoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  geoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  geoLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6b7280',
  },
  geoValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a2e',
    textAlign: 'right',
  },

  /* History */
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '4px',
  },
  historyMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  historyIp: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#4361ee',
    fontFamily: 'monospace',
  },
  historyLocation: {
    fontSize: '13px',
    color: '#6b7280',
  },
  historyTime: {
    fontSize: '12px',
    color: '#9ca3af',
  },
};

export default Home;
