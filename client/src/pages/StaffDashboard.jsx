import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../api';
import StatusBadge from '../components/shared/StatusBadge';
import Icon from '../components/shared/Icon';

const PRIORITY_BADGE = {
  high: { bg: 'color-mix(in oklab, var(--orange-sunrise) 14%, transparent)', fg: 'var(--orange-sunrise)', label: 'High' },
  med:  { bg: 'var(--surface-2)', fg: 'var(--text-muted)', label: 'Med' },
  low:  { bg: 'var(--surface-2)', fg: 'var(--text-soft)',  label: 'Low'  },
};

function PriorityBadge({ priority }) {
  const s = PRIORITY_BADGE[priority] || PRIORITY_BADGE.low;
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)', background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

const TAB_FILTERS = {
  all:     null,
  new:     'new',
  active:  undefined, // handled in js
  ready:   'ready',
  closed:  'closed',
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  const load = () => {
    setLoading(true);
    staffApi.listTickets()
      .then(({ data }) => setTickets(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    all:    tickets.length,
    new:    tickets.filter((t) => t.status === 'new').length,
    active: tickets.filter((t) => ['diagnosed', 'in-repair', 'awaiting-parts'].includes(t.status)).length,
    ready:  tickets.filter((t) => t.status === 'ready').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }), [tickets]);

  const filtered = useMemo(() => {
    let list = tickets;
    if (tab === 'new')    list = list.filter((t) => t.status === 'new');
    if (tab === 'active') list = list.filter((t) => ['diagnosed', 'in-repair', 'awaiting-parts'].includes(t.status));
    if (tab === 'ready')  list = list.filter((t) => t.status === 'ready');
    if (tab === 'closed') list = list.filter((t) => t.status === 'closed');
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.ticket_number.toLowerCase().includes(q)
          || t.client_name?.toLowerCase().includes(q)
          || t.device?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, tab, query]);

  const kpis = useMemo(() => ({
    open:    tickets.filter((t) => t.status !== 'closed').length,
    inRepair:tickets.filter((t) => t.status === 'in-repair').length,
    ready:   tickets.filter((t) => t.status === 'ready').length,
    new:     tickets.filter((t) => t.status === 'new').length,
  }), [tickets]);

  return (
    <div className="dash">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>Technician Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="toolbar">
            <button className="btn btn-secondary btn-sm" onClick={load}>
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/intake')}>
              <Icon name="plus" size={14} /> New intake
            </button>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="kpi-label">Open tickets</div>
            <div className="kpi-value">{kpis.open}</div>
            <div className="kpi-trend">{kpis.new} new</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">In repair</div>
            <div className="kpi-value">{kpis.inRepair}</div>
            <div className="kpi-trend">active work</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Ready for pickup</div>
            <div className="kpi-value" style={{ color: 'var(--green-grc)' }}>{kpis.ready}</div>
            <div className="kpi-trend">awaiting customer</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Total tickets</div>
            <div className="kpi-value">{tickets.length}</div>
            <div className="kpi-trend">all time</div>
          </div>
        </div>

        <div className="tabs">
          {[
            { key: 'all', label: 'All' },
            { key: 'new', label: 'New' },
            { key: 'active', label: 'Active' },
            { key: 'ready', label: 'Ready' },
            { key: 'closed', label: 'Closed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {label} <span className="count">{counts[key]}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Search ticket, client, or device…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Loading tickets…</p>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Client</th>
                <th>Device</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Tech</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/staff/tickets/${t.id}`)}>
                  <td className="mono"><span style={{ color: 'var(--accent)' }}>{t.ticket_number}</span></td>
                  <td>
                    {t.client_name || '—'}
                    {t.client_email && <span className="sub">{t.client_email}</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.device || '—'}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.technician || '—'}</td>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No tickets match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
