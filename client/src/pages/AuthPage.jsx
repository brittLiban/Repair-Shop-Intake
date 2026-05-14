import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import { Field, TextInput } from '../components/shared/FormPrimitives';
import Icon from '../components/shared/Icon';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'signin');
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already signed in — redirect away
  if (user) {
    return <Navigate to={user.role === 'staff' ? '/staff' : '/portal'} replace />;
  }

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'signin' ? authApi.login : authApi.register;
      const { data: res } = await fn(data);
      login(res.token, res.user);
      const redirect = searchParams.get('redirect');
      navigate(redirect || (res.user.role === 'staff' ? '/staff' : '/portal'), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-shell">
      <div className="container" style={{ maxWidth: 460 }}>
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

          <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 6 }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            {mode === 'signin'
              ? 'Track your repair, see technician notes, and get notified when ready.'
              : 'Create a free account to submit your intake forms and follow your repair.'}
          </p>

          <form onSubmit={submit}>
            <div className="field-stack">
              {mode === 'register' && (
                <>
                  <Field label="Full name" required>
                    <TextInput value={data.name} onChange={(v) => set('name', v)} placeholder="Jordan Smith" />
                  </Field>
                  <Field label="Phone number" hint="We use this to reach you when your device is ready">
                    <TextInput type="tel" value={data.phone} onChange={(v) => set('phone', v)} placeholder="(253) 555-0100" />
                  </Field>
                  <Field label="Student ID" hint="Optional">
                    <TextInput value={data.studentId} onChange={(v) => set('studentId', v)} placeholder="9012345678" />
                  </Field>
                </>
              )}
              <Field label="Email" required>
                <TextInput type="email" value={data.email} onChange={(v) => set('email', v)} placeholder="you@greenriver.edu" />
              </Field>
              <Field label="Password" required>
                <TextInput type="password" value={data.password} onChange={(v) => set('password', v)} placeholder="••••••••" />
              </Field>
            </div>

            {error && (
              <div style={{ marginTop: 14, padding: 10, background: 'color-mix(in oklab, var(--orange-sunrise) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--orange-sunrise) 30%, transparent)', borderRadius: 6, fontSize: 13, color: 'var(--orange-sunrise)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 20 }}
              disabled={loading}
            >
              {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
              {!loading && <Icon name="arrow-right" />}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            {mode === 'signin' ? (
              <>New here?{' '}
                <button
                  style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button
                  style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
                  onClick={() => { setMode('signin'); setError(''); }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Staff? Use your <span className="mono">@greenriver.edu</span> staff credentials to sign in.
          </div>
        </div>
      </div>
    </div>
  );
}
