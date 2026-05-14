import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ticketsApi } from '../api';
import StatusBadge from '../components/shared/StatusBadge';
import Icon from '../components/shared/Icon';

function Stat({ label, value, mono }) {
  return (
    <div style={{ background: 'var(--surface)', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value || '—'}</div>
    </div>
  );
}

function TicketDetail({ ticket }) {
  if (!ticket) {
    return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Select a ticket to view details.</div>;
  }
  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 6 }}>{ticket.ticket_number}</div>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{ticket.device || 'Device'}</h2>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <Stat label="Submitted" value={new Date(ticket.created_at).toLocaleDateString()} />
        <Stat label="Technician" value={ticket.technician} />
        <Stat label="Serial #" value={ticket.serial} mono />
      </div>

      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 14 }}>Updates</h3>
      {ticket.updates?.length ? (
        <div style={{ position: 'relative', paddingLeft: 22 }}>
          <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--border)' }} />
          {ticket.updates.map((u, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: -22, top: 4, width: 13, height: 13, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--surface)', border: '2px solid ' + (i === 0 ? 'var(--accent)' : 'var(--border-strong)') }} />
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>
                {new Date(u.created_at).toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{u.message}</div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No updates yet.</p>
      )}

      {ticket.status === 'ready' && (
        <div style={{ marginTop: 20, padding: 16, background: 'color-mix(in oklab, var(--accent) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', borderRadius: 10, fontSize: 14 }}>
          <strong>Ready for pickup</strong> — TC-104, during shop hours. Bring a valid photo ID.
        </div>
      )}
    </div>
  );
}

export default function Portal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ticketsApi.list()
      .then(({ data }) => {
        setTickets(data);
        if (data.length) setSelected(data[0].id);
      })
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selected);
  const active = tickets.filter((t) => t.status !== 'closed').length;
  const ready = tickets.filter((t) => t.status === 'ready').length;

  return (
    <div className="form-shell">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} /> Customer portal
            </div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Hi, {user.name?.split(' ')[0] || user.email}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {active} active repair{active !== 1 ? 's' : ''} · {ready} ready for pickup
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/intake')}>
              <Icon name="plus" /> Start new repair
            </button>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading your tickets…</p>}
        {error && <p style={{ color: 'var(--orange-sunrise)' }}>{error}</p>}

        {!loading && !tickets.length && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div>
            <h2 style={{ marginBottom: 8 }}>No tickets yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start a repair to see your tickets here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/intake')}>Start a repair</button>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="ticket-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 4 }}>Your tickets</h3>
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  style={{
                    textAlign: 'left', padding: 16, borderRadius: 10,
                    border: '1px solid ' + (selected === t.id ? 'var(--accent)' : 'var(--border)'),
                    background: selected === t.id
                      ? 'color-mix(in oklab, var(--accent) 6%, var(--surface))'
                      : 'var(--surface)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: selected === t.id ? '0 0 0 3px color-mix(in oklab, var(--accent) 14%, transparent)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>{t.ticket_number}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{t.device || 'Device'}</div>
                  <StatusBadge status={t.status} />
                </button>
              ))}
            </div>
            <TicketDetail ticket={selectedTicket} />
          </div>
        )}
      </div>
    </div>
  );
}
