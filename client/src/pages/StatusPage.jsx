import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ticketsApi } from '../api';
import { Field, TextInput } from '../components/shared/FormPrimitives';
import StatusBadge from '../components/shared/StatusBadge';
import Icon from '../components/shared/Icon';

const KIND_STYLES = {
  event: { color: 'var(--green-grc)', bg: 'color-mix(in oklab, var(--green-grc) 14%, transparent)', label: 'UPDATE' },
  note:  { color: 'var(--accent)',    bg: 'color-mix(in oklab, var(--accent) 12%, transparent)',    label: 'NOTE'   },
};

const TABS = [
  { key: 'number', label: 'Ticket number' },
  { key: 'email',  label: 'Email' },
  { key: 'name',   label: 'Name & phone' },
];

function TicketResult({ ticket }) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            {ticket.ticket_number}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{ticket.device || 'Device'}</div>
          {ticket.serial && (
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>S/N: {ticket.serial}</div>
          )}
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Submitted {new Date(ticket.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        {ticket.updated_at !== ticket.created_at && (
          <> · Last updated {new Date(ticket.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>
        )}
      </div>

      {ticket.updates?.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14 }}>
            Activity
          </div>
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: 'var(--border)' }} />
            {ticket.updates.map((u, i) => {
              const s = KIND_STYLES[u.kind] || KIND_STYLES.note;
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
                  <span style={{ position: 'absolute', left: -22, top: 4, width: 13, height: 13, borderRadius: '50%', background: s.color, border: '2px solid ' + s.color, boxShadow: '0 0 0 3px var(--surface)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                      {new Date(u.created_at).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: s.bg, color: s.color, letterSpacing: '0.05em' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{u.message}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {ticket.updates?.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
          No updates yet — your ticket is in the queue.
        </div>
      )}
    </div>
  );
}

function TicketList({ tickets, onSelect }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found — select one to see details.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tickets.map((t) => (
          <button
            key={t.ticket_number}
            onClick={() => onSelect(t.ticket_number)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>{t.ticket_number}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.device || 'Device'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
            <StatusBadge status={t.status} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('number');
  const [ticketNumber, setTicketNumber] = useState(searchParams.get('ticket') || '');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [listResults, setListResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('ticket');
    if (t) {
      ticketsApi.lookupByNumber(t)
        .then(({ data }) => setResult(data))
        .catch(() => setError('Ticket not found. Check the number and try again.'));
    }
  }, []);

  const reset = () => { setError(''); setResult(null); setListResults(null); };
  const switchTab = (key) => { setMode(key); reset(); };

  const selectTicket = async (num) => {
    reset(); setLoading(true);
    try {
      const { data } = await ticketsApi.lookupByNumber(num);
      setResult(data);
      setMode('number');
      setTicketNumber(num);
    } catch {
      setError('Could not load that ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const lookupByNumber = async (e) => {
    e.preventDefault(); reset();
    if (!ticketNumber.trim()) return;
    setLoading(true);
    try {
      const { data } = await ticketsApi.lookupByNumber(ticketNumber.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ticket not found. Check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const lookupByEmail = async (e) => {
    e.preventDefault(); reset();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await ticketsApi.lookupByEmail(email.trim());
      data.tickets.length === 0
        ? setError('No tickets found for that email address.')
        : setListResults(data.tickets);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const lookupByNamePhone = async (e) => {
    e.preventDefault(); reset();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      const { data } = await ticketsApi.lookupByNamePhone(name.trim(), phone.trim());
      data.tickets.length === 0
        ? setError('No tickets found for that name and phone number.')
        : setListResults(data.tickets);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-shell">
      <div className="container" style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Check repair status</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Look up your ticket using any of the methods below.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              style={{
                flex: 1, padding: '11px 8px', border: 'none',
                borderRight: i < TABS.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                background: mode === tab.key ? 'var(--accent)' : 'var(--surface-2)',
                color: mode === tab.key ? 'white' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ticket number */}
        {mode === 'number' && (
          <form onSubmit={lookupByNumber}>
            <Field label="Ticket number">
              <TextInput value={ticketNumber} onChange={(v) => setTicketNumber(v.toUpperCase())} placeholder="GRC-XXXXXX-XXXX" />
            </Field>
            <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading || !ticketNumber.trim()}>
              {loading ? 'Looking up…' : <><Icon name="search" size={14} /> Look up ticket</>}
            </button>
          </form>
        )}

        {/* Email */}
        {mode === 'email' && (
          <form onSubmit={lookupByEmail}>
            <Field label="Email address you used at intake">
              <TextInput type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            </Field>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              We'll show all tickets submitted with that email.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading || !email.trim()}>
              {loading ? 'Searching…' : <><Icon name="search" size={14} /> Find my tickets</>}
            </button>
          </form>
        )}

        {/* Name + phone */}
        {mode === 'name' && (
          <form onSubmit={lookupByNamePhone}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Full name">
                <TextInput value={name} onChange={setName} placeholder="Your full name" />
              </Field>
              <Field label="Phone number">
                <TextInput type="tel" value={phone} onChange={setPhone} placeholder="(253) 555-0142" />
              </Field>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
              Must match the name and phone you entered at intake.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading || !name.trim() || !phone.trim()}>
              {loading ? 'Searching…' : <><Icon name="search" size={14} /> Find my tickets</>}
            </button>
          </form>
        )}

        {error && (
          <div style={{ marginTop: 20, padding: '12px 14px', background: 'color-mix(in oklab, var(--orange-sunrise) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--orange-sunrise) 30%, transparent)', borderRadius: 8, fontSize: 13, color: 'var(--orange-sunrise)' }}>
            {error}
          </div>
        )}

        {listResults && <TicketList tickets={listResults} onSelect={selectTicket} />}
        {result && <TicketResult ticket={result} />}
      </div>
    </div>
  );
}
