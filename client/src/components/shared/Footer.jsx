import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row">
        <div>
          <strong style={{ color: 'var(--text)' }}>Green River PC Repair Shop</strong>
          &nbsp;·&nbsp; Green River College &nbsp;·&nbsp; IT Program &nbsp;·&nbsp; TC-104
        </div>
        <div className="links">
          <span style={{ color: 'var(--text-muted)' }}>All services free · Donations welcome</span>
          <Link to="/staff/login" style={{ color: 'var(--text-soft)', fontSize: 12 }}>
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
