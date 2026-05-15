import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
          <Link
            to="/"
            className="nav-link always"
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>

          <Link
            to="/intake"
            className="nav-link always"
            aria-current={location.pathname.startsWith('/intake') ? 'page' : undefined}
          >
            Start a repair
          </Link>

          <Link
            to="/status"
            className="nav-link always"
            aria-current={location.pathname.startsWith('/status') ? 'page' : undefined}
          >
            Check status
          </Link>

          {user?.role === 'staff' ? (
            <>
              <Link
                to="/staff"
                className="nav-link always"
                aria-current={location.pathname.startsWith('/staff') && !location.pathname.includes('login') ? 'page' : undefined}
              >
                Dashboard
              </Link>
              <button
                className="btn-signin"
                onClick={handleSignOut}
                style={{ marginLeft: 8 }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/staff/login"
              className="btn-signin primary"
              style={{ marginLeft: 8 }}
            >
              Staff login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
