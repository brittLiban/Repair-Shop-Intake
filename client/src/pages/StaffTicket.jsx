import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi } from '../api';
import { Field, TextInput, TextArea, Select } from '../components/shared/FormPrimitives';
import SignaturePad from '../components/shared/SignaturePad';
import StatusBadge from '../components/shared/StatusBadge';
import Icon from '../components/shared/Icon';

const STATUS_OPTIONS = [
  { value: 'new',            label: 'New' },
  { value: 'diagnosed',      label: 'Diagnosed' },
  { value: 'in-repair',      label: 'In repair' },
  { value: 'awaiting-parts', label: 'Awaiting parts' },
  { value: 'ready',          label: 'Ready for pickup' },
  { value: 'closed',         label: 'Closed' },
];

const LEDGER_ITEMS = ['PC / Laptop', 'Power Supply', 'External HD', 'Flash Drive(s)', 'Mouse', 'Software', 'Screen', 'Operating System', 'Other'];

function FormCard({ title, form }) {
  if (!form) return null;
  const d = form.form_data;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {title}
      </h3>
      <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 16px', fontSize: 13 }}>
        {Object.entries(d).map(([k, v]) => {
          if (typeof v === 'object' || v === null || v === '' || k === 'sig') return null;
          return [
            <dt key={'dt-' + k} style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{k}</dt>,
            <dd key={'dd-' + k} style={{ margin: 0, color: 'var(--text)', wordBreak: 'break-word' }}>{String(v)}</dd>,
          ];
        })}
      </dl>
      {d.issues && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>ISSUES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(d.issues).filter(([, v]) => v).map(([k]) => (
              <span key={k} style={{ padding: '2px 8px', borderRadius: 4, background: 'color-mix(in oklab, var(--accent) 12%, transparent)', color: 'var(--accent)', fontSize: 12 }}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
    } catch (e) {
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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
            <input
              type="text"
              className="input"
              value={items[item]?.custInitial || ''}
              onChange={(e) => setItem(item, 'custInitial', e.target.value.toUpperCase().slice(0, 4))}
              placeholder="XX"
              style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, height: 36, padding: '0 8px' }}
            />
            <input
              type="text"
              className="input"
              value={items[item]?.techInitial || ''}
              onChange={(e) => setItem(item, 'techInitial', e.target.value.toUpperCase().slice(0, 4))}
              placeholder="XX"
              style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, height: 36, padding: '0 8px' }}
            />
            <input
              type="text"
              className="input"
              value={items[item]?.note || ''}
              onChange={(e) => setItem(item, 'note', e.target.value)}
              placeholder="Optional note"
            />
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

export default function StaffTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editTech, setEditTech] = useState('');
  const [editPriority, setEditPriority] = useState('');

  const load = () => {
    setLoading(true);
    staffApi.getTicket(id)
      .then(({ data }) => {
        setTicket(data);
        setEditStatus(data.status);
        setEditTech(data.technician || '');
        setEditPriority(data.priority || 'med');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await staffApi.updateTicket(id, {
        status: editStatus,
        technician: editTech,
        priority: editPriority,
        note: note.trim() || undefined,
      });
      setNote('');
      load();
    } catch {
      alert('Update failed. Please try again.');
    } finally {
      setSaving(false);
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

  return (
    <div className="form-shell">
      <div className="container">
        <div className="breadcrumbs">
          <button style={{ background: 'none', border: 0, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: 0 }} onClick={() => navigate('/staff')}>
            Dashboard
          </button>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-muted)' }}>{ticket.ticket_number}</span>
        </div>

        <div className="form-header">
          <div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>{ticket.ticket_number}</div>
            <h1 style={{ fontSize: 28 }}>{ticket.device || 'Unnamed device'}</h1>
            {ticket.serial && <div className="mono" style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>S/N: {ticket.serial}</div>}
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="staff-ticket-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
          {/* Left: form submissions + timeline */}
          <div>
            <FormCard title="F01 · Issue Description" form={issueForm} />
            <FormCard title="F02 · Policies" form={policiesForm} />
            <FormCard title="F03 · Work Order" form={workForm} />
            {!hasEquipmentLedger && (
              <EquipmentLedgerForm ticketId={id} onSaved={load} />
            )}
            {hasEquipmentLedger && (
              <FormCard title="F04 · Equipment Ledger" form={ticket.forms.find((f) => f.form_type === 'equipment')} />
            )}

            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Update timeline
              </h3>
              <div style={{ position: 'relative', paddingLeft: 22, marginBottom: 20 }}>
                <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--border)' }} />
                {ticket.updates?.map((u, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
                    <span style={{ position: 'absolute', left: -22, top: 4, width: 13, height: 13, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--surface)', border: '2px solid ' + (i === 0 ? 'var(--accent)' : 'var(--border-strong)') }} />
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>
                      {new Date(u.created_at).toLocaleString()} · {u.author}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{u.message}</div>
                  </div>
                ))}
              </div>
              <Field label="Add update note">
                <TextArea value={note} onChange={setNote} rows={3} placeholder="Note visible to customer and staff…" />
              </Field>
            </div>
          </div>

          {/* Right: client info + controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Client
              </h3>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Name</dt><dd style={{ margin: 0 }}>{ticket.client_name || '—'}</dd></div>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email</dt><dd style={{ margin: 0 }}><a href={'mailto:' + ticket.client_email}>{ticket.client_email || '—'}</a></dd></div>
                <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Phone</dt><dd style={{ margin: 0 }}>{ticket.client_phone || '—'}</dd></div>
                {ticket.student_id && <div><dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student ID</dt><dd className="mono" style={{ margin: 0 }}>{ticket.student_id}</dd></div>}
              </dl>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Ticket controls
              </h3>
              <div className="field-stack">
                <Field label="Status">
                  <Select
                    value={editStatus}
                    onChange={setEditStatus}
                    options={STATUS_OPTIONS}
                  />
                </Field>
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
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                disabled={saving}
                onClick={save}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>

            <div className="card" style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
              <div>Submitted {new Date(ticket.created_at).toLocaleDateString()}</div>
              <div className="mono" style={{ marginTop: 4 }}>{ticket.ticket_number}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
