import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import Icon from './Icon';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff = user?.role === 'staff';
  const active = (path) => location.pathname.startsWith(path) ? 'page' : undefined;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container bar">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <span className="mark">G</span>
          <span className="name">Green River PC Repair Shop</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link always" aria-current={location.pathname === '/' ? 'page' : undefined}>
            Home
          </Link>

          {!isStaff && (
            <Link to="/intake" className="nav-link always" aria-current={active('/intake')}>
              Start Repair
            </Link>
          )}

          {isStaff && (
            <Link to="/staff" className="nav-link always" aria-current={active('/staff')}>
              Dashboard
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <button
                className="btn-signin"
                onClick={() => navigate(isStaff ? '/staff' : '/portal')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--accent)', color: 'white',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}>
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                  {isStaff ? 'Staff' : 'My tickets'}
                </span>
              </button>
              <button className="btn-signin" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-signin primary" style={{ marginLeft: 8 }}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
