import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import { Field, TextInput } from '../components/shared/FormPrimitives';
import Icon from '../components/shared/Icon';

export default function AuthPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already signed in as staff
  if (user?.role === 'staff') {
    return <Navigate to="/staff" replace />;
  }

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: res } = await authApi.login(data);
      if (res.user.role !== 'staff') {
        setError('This login is for shop staff only.');
        return;
      }
      login(res.user);
      navigate('/staff', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-shell">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <span style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--accent)', color: 'white',
              display: 'grid', placeItems: 'center',
              fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-mono)',
            }}>
              G
            </span>
          </div>

          <h1 style={{ fontSize: 24, textAlign: 'center', marginBottom: 4 }}>Staff login</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            Green River PC Repair Shop · technician portal
          </p>

          <form onSubmit={submit}>
            <div className="field-stack">
              <Field label="Email" required>
                <TextInput
                  type="email"
                  value={data.email}
                  onChange={(v) => set('email', v)}
                  placeholder="you@greenriver.edu"
                />
              </Field>
              <Field label="Password" required>
                <TextInput
                  type="password"
                  value={data.password}
                  onChange={(v) => set('password', v)}
                  placeholder="••••••••"
                />
              </Field>
            </div>

            {error && (
              <div style={{
                marginTop: 14, padding: 10,
                background: 'color-mix(in oklab, var(--orange-sunrise) 10%, transparent)',
                border: '1px solid color-mix(in oklab, var(--orange-sunrise) 30%, transparent)',
                borderRadius: 6, fontSize: 13, color: 'var(--orange-sunrise)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 20 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <Icon name="arrow-right" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
