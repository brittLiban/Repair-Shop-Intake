import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi } from '../api';
import { Field, TextInput, TextArea, Select } from '../components/shared/FormPrimitives';
import SignaturePad from '../components/shared/SignaturePad';
import StatusBadge from '../components/shared/StatusBadge';
import Icon from '../components/shared/Icon';

const STAGES = [
  { value: 'new',            label: 'New' },
  { value: 'diagnosed',      label: 'Diagnosed' },
  { value: 'in-repair',      label: 'In repair' },
  { value: 'awaiting-parts', label: 'Awaiting parts' },
  { value: 'ready',          label: 'Ready for pickup' },
  { value: 'closed',         label: 'Closed' },
];

const ISSUE_LABELS = {
  q1: 'What problems are you having? When did it start?',
  q2: 'Downloaded updates or programs before the problem?',
  q3: 'Hardware modifications since purchase?',
  q4: 'Device environment during daily use?',
  q5: 'What do you want resolved?',
  additional: 'Additional information',
};

const LEDGER_ITEMS = ['PC / Laptop', 'Power Supply', 'External HD', 'Flash Drive(s)', 'Mouse', 'Software', 'Screen', 'Operating System', 'Other'];

// ── Status pipeline ──────────────────────────────────────────────────────────

function StatusPipeline({ current, onQuickChange }) {
  const idx = STAGES.findIndex((s) => s.value === current);
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {STAGES.map((s, i) => {
        const isActive = s.value === current;
        const isDone   = i < idx;
        return (
          <button
            key={s.value}
            onClick={() => onQuickChange(s.value)}
            title={`Move to: ${s.label}`}
            style={{
              flex: 1, padding: '10px 4px', border: 'none', borderRight: i < STAGES.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: isActive ? 700 : 400,
              background: isActive ? 'var(--accent)' : isDone ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : 'var(--surface-2)',
              color: isActive ? 'white' : isDone ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'background 0.15s, color 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            {isDone && <Icon name="check" size={11} />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Problem summary ──────────────────────────────────────────────────────────

function ProblemCard({ issueForm }) {
  if (!issueForm) return null;
  const d = issueForm.form_data;
  const submitted = new Date(issueForm.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
          Reported problem
        </h3>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>Submitted {submitted}</span>
      </div>

      {d.q1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>WHAT'S WRONG / WHEN DID IT START</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)', background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 6 }}>{d.q1}</div>
        </div>
      )}

      {d.q5 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>WHAT DO THEY WANT RESOLVED</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)', background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 6 }}>{d.q5}</div>
        </div>
      )}

      {d.q2 && d.q2.toLowerCase() !== 'n/a' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>RECENT DOWNLOADS / UPDATES</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{d.q2}</div>
        </div>
      )}
      {d.q3 && d.q3.toLowerCase() !== 'n/a' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>HARDWARE MODIFICATIONS</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{d.q3}</div>
        </div>
      )}
      {d.q4 && d.q4.toLowerCase() !== 'n/a' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>USAGE ENVIRONMENT</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{d.q4}</div>
        </div>
      )}
      {d.additional && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>ADDITIONAL NOTES</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{d.additional}</div>
        </div>
      )}
    </div>
  );
}

// ── Work log ─────────────────────────────────────────────────────────────────

const KIND_META = {
  change: { dot: 'var(--text-soft)',  bg: 'var(--surface-2)',                                             fg: 'var(--text-soft)',  label: 'CHANGE', msgColor: 'var(--text-muted)' },
  event:  { dot: 'var(--green-grc)',  bg: 'color-mix(in oklab, var(--green-grc) 14%, transparent)',       fg: 'var(--green-grc)', label: 'EVENT',  msgColor: 'var(--text)' },
  note:   { dot: 'var(--accent)',     bg: 'color-mix(in oklab, var(--accent) 12%, transparent)',          fg: 'var(--accent)',    label: 'NOTE',   msgColor: 'var(--text)' },
};

function WorkLog({ changelog, note, setNote, postingNote, onPostNote }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Work log
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="eye" size={11} /> Notes &amp; events visible to customer
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: 24, marginBottom: 22 }}>
        <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1, background: 'var(--border)' }} />
        {!changelog?.length && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activity yet.</p>
        )}
        {changelog?.map((u, i) => {
          const m = KIND_META[u.kind] || KIND_META.note;
          return (
            <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: -24, top: 5, width: 14, height: 14, borderRadius: '50%', background: m.dot, boxShadow: '0 0 0 3px var(--surface)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{new Date(u.created_at).toLocaleString()}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{u.author}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: m.bg, color: m.fg, letterSpacing: '0.05em' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 13, color: m.msgColor, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{u.message}</div>
            </div>
          );
        })}
      </div>

      <Field label="Add work note">
        <TextArea value={note} onChange={setNote} rows={3} placeholder="What was found, what was done, what's next…" />
      </Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
          <Icon name="eye" size={11} /> Visible to customer on the status page
        </span>
        <button
          className="btn btn-primary btn-sm"
          disabled={postingNote || !note.trim()}
          onClick={onPostNote}
        >
          {postingNote ? 'Posting…' : 'Post note'}
        </button>
      </div>
    </div>
  );
}

// ── Intake form cards ─────────────────────────────────────────────────────────

function FormCard({ title, form, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!form) return null;
  const d = form.form_data;
  const submitted = new Date(form.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{submitted}</span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '8px 16px', fontSize: 13 }}>
            {Object.entries(d).map(([k, v]) => {
              if (k === 'sig' || k === 'issues' || v === null || v === '') return null;
              if (typeof v === 'object') return null;
              const label = ISSUE_LABELS[k] || k;
              return [
                <dt key={'dt-' + k} style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, wordBreak: 'break-word' }}>{label}</dt>,
                <dd key={'dd-' + k} style={{ margin: 0, color: 'var(--text)', wordBreak: 'break-word', lineHeight: 1.5 }}>{String(v)}</dd>,
              ];
            })}
          </dl>
          {d.issues && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>ISSUE TYPES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(d.issues).filter(([, v]) => v).map(([k]) => (
                  <span key={k} style={{ padding: '2px 8px', borderRadius: 4, background: 'color-mix(in oklab, var(--accent) 12%, transparent)', color: 'var(--accent)', fontSize: 12 }}>{k}</span>
                ))}
              </div>
            </div>
          )}
          {d.sig && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>SIGNATURE</div>
              <img src={d.sig} alt="Signature" style={{ maxHeight: 60, border: '1px solid var(--border)', borderRadius: 4, background: 'white', padding: 4 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Equipment ledger form ─────────────────────────────────────────────────────

function EquipmentLedgerForm({ ticketId, onSaved }) {
  const [items, setItems] = useState({});
  const [sig, setSig] = useState('');
  const [saving, setSaving] = useState(false);
  const setItem = (item, col, v) => setItems((prev) => ({ ...prev, [item]: { ...prev[item], [col]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await staffApi.submitForm(ticketId, { formType: 'equipment', formData: { items, sig } });
      onSaved();
    } catch {
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3 style={{ marginBottom: 4, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        F04 · Equipment Ledger (Drop-Off)
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Complete jointly with customer at drop-off.</p>
      <div className="ledger-table">
        <div className="ledger-row ledger-head">
          <div>Item</div>
          <div className="group" data-color="drop">Customer Initial</div>
          <div className="group" data-color="drop">Tech Initial</div>
          <div>Notes</div>
        </div>
        {LEDGER_ITEMS.map((item) => (
          <div className="ledger-row" key={item} style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1.6fr' }}>
            <div className="item-name">{item}</div>
            <input type="text" className="input" value={items[item]?.custInitial || ''}
              onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1); setItem(item, 'custInitial', v); }}
              placeholder="A" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, height: 36, padding: '0 8px' }} />
            <input type="text" className="input" value={items[item]?.techInitial || ''}
              onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1); setItem(item, 'techInitial', v); }}
              placeholder="A" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, height: 36, padding: '0 8px' }} />
            <input type="text" className="input" value={items[item]?.note || ''}
              onChange={(e) => setItem(item, 'note', e.target.value)} placeholder="Optional note" />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Field label="Technician signature">
          <SignaturePad value={sig} onChange={setSig} label="Technician signature" />
        </Field>
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save equipment ledger'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StaffTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postingNote, setPostingNote] = useState(false);
  const [note, setNote] = useState('');
  const [editTech, setEditTech] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editParts, setEditParts] = useState('');

  const load = () => {
    setLoading(true);
    staffApi.getTicket(id)
      .then(({ data }) => {
        setTicket(data);
        setEditTech(data.technician || '');
        setEditPriority(data.priority || 'med');
        setEditParts(data.parts_needed || '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const quickStatus = async (newStatus) => {
    if (!ticket || newStatus === ticket.status) return;
    try {
      await staffApi.updateTicket(id, { status: newStatus });
      load();
    } catch {
      alert('Status update failed.');
    }
  };

  const saveControls = async () => {
    setSaving(true);
    try {
      await staffApi.updateTicket(id, {
        technician: editTech,
        priority: editPriority,
        parts_needed: editParts,
      });
      load();
    } catch {
      alert('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const postNote = async () => {
    if (!note.trim()) return;
    setPostingNote(true);
    try {
      await staffApi.updateTicket(id, { note: note.trim() });
      setNote('');
      load();
    } catch {
      alert('Failed to post note. Please try again.');
    } finally {
      setPostingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="form-shell">
        <div className="container" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading ticket…
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="form-shell">
        <div className="container" style={{ padding: 48, textAlign: 'center' }}>
          Ticket not found. <button className="btn btn-ghost" onClick={() => navigate('/staff')}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  const hasEquipmentLedger = ticket.forms?.some((f) => f.form_type === 'equipment');
  const issueForm    = ticket.forms?.find((f) => f.form_type === 'issue');
  const policiesForm = ticket.forms?.find((f) => f.form_type === 'policies');
  const workForm     = ticket.forms?.find((f) => f.form_type === 'workorder');
  const statusLink   = `${window.location.origin}/status?ticket=${ticket.ticket_number}`;

  return (
    <div className="form-shell">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumbs">
          <button style={{ background: 'none', border: 0, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: 0 }} onClick={() => navigate('/staff')}>
            Dashboard
          </button>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-muted)' }}>{ticket.ticket_number}</span>
        </div>

        {/* Header */}
        <div className="form-header">
          <div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 6 }}>{ticket.ticket_number}</div>
            <h1 style={{ fontSize: 28 }}>{ticket.device || 'Unnamed device'}</h1>
            {ticket.serial && <div className="mono" style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>S/N: {ticket.serial}</div>}
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Status pipeline */}
        <StatusPipeline current={ticket.status} onQuickChange={quickStatus} />

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>

          {/* LEFT: problem + work log + forms */}
          <div>
            <ProblemCard issueForm={issueForm} />
            <WorkLog
              changelog={ticket.changelog}
              note={note}
              setNote={setNote}
              postingNote={postingNote}
              onPostNote={postNote}
            />

            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10, marginTop: 8 }}>
              Intake forms
            </div>
            <FormCard title="F01 · Issue Description" form={issueForm} />
            <FormCard title="F02 · Policies" form={policiesForm} />
            <FormCard title="F03 · Work Order / Release" form={workForm} />
            {!hasEquipmentLedger && <EquipmentLedgerForm ticketId={id} onSaved={load} />}
            {hasEquipmentLedger && (
              <FormCard title="F04 · Equipment Ledger" form={ticket.forms.find((f) => f.form_type === 'equipment')} />
            )}
          </div>

          {/* RIGHT: client + controls + tracking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Client */}
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Client
              </h3>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Name</dt><dd style={{ margin: 0 }}>{ticket.client_name || '—'}</dd></div>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email</dt><dd style={{ margin: 0 }}><a href={'mailto:' + ticket.client_email} style={{ color: 'var(--accent)' }}>{ticket.client_email || '—'}</a></dd></div>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Phone</dt><dd style={{ margin: 0 }}>{ticket.client_phone || '—'}</dd></div>
              </dl>
            </div>

            {/* Ticket controls */}
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Ticket details
              </h3>
              <div className="field-stack">
                <Field label="Assigned technician">
                  <TextInput value={editTech} onChange={setEditTech} placeholder="Technician name" />
                </Field>
                <Field label="Priority">
                  <Select
                    value={editPriority}
                    onChange={setEditPriority}
                    options={[{ value: 'high', label: 'High' }, { value: 'med', label: 'Med' }, { value: 'low', label: 'Low' }]}
                  />
                </Field>
                <Field label="Parts needed / what to order">
                  <TextArea value={editParts} onChange={setEditParts} rows={3} placeholder="e.g. 512GB NVMe SSD (M.2 2280)…" />
                </Field>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} disabled={saving} onClick={saveControls}>
                {saving ? 'Saving…' : 'Save details'}
              </button>
            </div>

            {/* Customer tracking link */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Customer tracking link
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                Share this with the customer so they can track their repair status.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text)', background: 'var(--surface-2)', padding: '5px 8px', borderRadius: 5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  /status?ticket={ticket.ticket_number}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigator.clipboard.writeText(statusLink)}
                  title="Copy link"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 4px' }}>
              Submitted {new Date(ticket.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              <br />
              Last updated {new Date(ticket.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
