import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../api';
import { Field, TextInput, TextArea, Pill, IssueChip } from '../components/shared/FormPrimitives';
import SignaturePad from '../components/shared/SignaturePad';
import Icon from '../components/shared/Icon';

// ── Step indicators ─────────────────────────────────────────────────────────

function StepBar({ step }) {
  const steps = ['Issue Description', 'Shop Policies', 'Work Order'];
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : 'future';
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i > 0 && (
              <div style={{ position: 'absolute', left: 0, right: '50%', top: 13, height: 2, background: state === 'future' ? 'var(--border)' : 'var(--accent)', transform: 'translateX(-50%)' }} />
            )}
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', left: '50%', right: 0, top: 13, height: 2, background: state === 'done' ? 'var(--accent)' : 'var(--border)' }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', zIndex: 1,
              background: state === 'future' ? 'var(--surface-2)' : 'var(--accent)',
              border: state === 'active' ? '3px solid var(--accent)' : '2px solid ' + (state === 'done' ? 'var(--accent)' : 'var(--border)'),
              display: 'grid', placeItems: 'center',
              color: state === 'future' ? 'var(--text-soft)' : 'white',
              fontSize: 12, fontWeight: 600,
            }}>
              {state === 'done' ? <Icon name="check" size={12} /> : i + 1}
            </div>
            <span style={{ marginTop: 8, fontSize: 12, color: state === 'active' ? 'var(--text)' : 'var(--text-muted)', fontWeight: state === 'active' ? 600 : 400, textAlign: 'center' }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── F01 · Issue Description ──────────────────────────────────────────────────

function StepIssue({ data, onChange, onNext }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const valid = data.q1?.trim() && data.q5?.trim();

  return (
    <div>
      <div className="form-section">
        <h2>Your Information</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Device (make & model)" required hint="e.g. Dell XPS 15, HP Pavilion">
              <TextInput value={data.device} onChange={(v) => set('device', v)} placeholder="Dell XPS 15 9520" />
            </Field>
            <Field label="Serial number" hint="Usually on a sticker on the bottom of the device">
              <TextInput value={data.serial} onChange={(v) => set('serial', v)} placeholder="Manufacturer S/N" />
            </Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Problem Description</h2>
        <div className="field-stack">
          <Field label="1. What problems are you having? When did it start?" required>
            <TextArea value={data.q1} onChange={(v) => set('q1', v)} rows={4} placeholder="Describe the issue and approximate start date." />
          </Field>
          <Field label="2. Did you download any updates or programs before the problem started? Which ones?">
            <TextArea value={data.q2} onChange={(v) => set('q2', v)} rows={3} placeholder="N/A if none." />
          </Field>
          <Field label="3. Has any hardware modification been done since purchase?" hint="e.g. new battery, SSD, RAM upgrade">
            <TextArea value={data.q3} onChange={(v) => set('q3', v)} rows={3} placeholder="N/A if none." />
          </Field>
          <Field label="4. What environment is the device in during daily use?" hint="Humidity, dusty, hot, cold, etc.">
            <TextArea value={data.q4} onChange={(v) => set('q4', v)} rows={3} placeholder="e.g. Home desk, mostly indoors, climate controlled." />
          </Field>
          <Field label="5. What do you want resolved?" required>
            <TextArea value={data.q5} onChange={(v) => set('q5', v)} rows={4} placeholder="e.g. Get it to boot, remove malware, faster startup." />
          </Field>
          <Field label="Additional information">
            <TextArea value={data.additional} onChange={(v) => set('additional', v)} rows={3} placeholder="Anything else we should know." />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <div />
        <button
          className="btn btn-primary btn-lg"
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
          onClick={onNext}
        >
          Next: Shop Policies <Icon name="arrow-right" />
        </button>
      </div>
    </div>
  );
}

// ── F02 · Policies ───────────────────────────────────────────────────────────

const POLICIES = [
  { n: 1, key: 'privacy', title: 'Privacy Policy', body: 'The staff of the Green River PC Repair Shop will exercise due care to secure your personal information / computer data. We do not sell, trade, or transfer to outside parties any of your personal information or computer data.' },
  { n: 2, key: 'security', title: 'Security Policy', body: 'The staff of the Green River PC Repair Shop will do everything within our power to secure your personal property. We do not sell, trade, or transfer to outside parties any of the equipment you bring in for repair.' },
  { n: 3, key: 'repair', title: 'Repair Policy', body: 'The staff will do everything within our abilities to repair your equipment, however not all equipment can be repaired at this location. We are a student-run facility with limited diagnostic equipment. We do not have the ability to order computer parts or software. We are happy to install parts or software you provide at no further cost. We are not liable for any voided warranties. Services are intended for individual owners only. All repairs are first-come, first-served.' },
  { n: 4, key: 'donation', title: 'Donation Policy', body: 'A donation to the shop is greatly appreciated but not required! Donations can be accepted anytime during the process and pay for shop supplies and software for diagnosing system issues.' },
  { n: 5, key: 'abandoned', title: 'Abandoned Property', body: 'Upon completion of work, Green River PC Repair Shop will contact the owner. If equipment is not picked up within 180 days after contact, all equipment will be considered abandoned and recycled. We will make due effort to contact you by phone and / or email.' },
  { n: 6, key: 'backup', title: 'Backup Policy', body: 'If you want a backup of your files for personal use, you must supply the storage media (flash drive, external hard drive, etc.).' },
  { n: 7, key: 'software', title: 'Software Policy', body: 'We will only work on legitimate installations of Windows OS. Any computer found to have an unofficial copy of Windows will be returned immediately without further repair.' },
];

function StepPolicies({ data, onChange, onNext, onBack }) {
  const set = (k, v) => onChange({ ...data, initials: { ...data.initials, [k]: v } });
  const allDone = POLICIES.every((p) => (data.initials?.[p.key] || '').trim().length >= 2);
  const hasSig = (data.sig || '').length > 100;
  const valid = allDone && hasSig && data.name?.trim();

  return (
    <div>
      <div className="form-section">
        <h2>Client</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Full legal name" required>
              <TextInput value={data.name} onChange={(v) => onChange({ ...data, name: v })} placeholder="Your full name" />
            </Field>
            <Field label="Today's date" required>
              <TextInput type="date" value={data.date} onChange={(v) => onChange({ ...data, date: v })} />
            </Field>
          </div>
        </div>
      </div>

      {POLICIES.map((p) => (
        <div className="form-section" key={p.key}>
          <h2><span style={{ color: 'var(--accent)' }}>{p.n}.</span>&nbsp;&nbsp;{p.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start' }} className="policy-grid">
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{p.body}</div>
            <div style={{ width: 120 }}>
              <Field label="Initial" required>
                <TextInput
                  value={data.initials?.[p.key] || ''}
                  onChange={(v) => set(p.key, v.toUpperCase().slice(0, 4))}
                  placeholder="XX"
                  style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.1em' }}
                />
              </Field>
            </div>
          </div>
        </div>
      ))}

      <div className="form-section">
        <h2>Signature</h2>
        <div className="field-stack">
          <Field label="Client signature" required>
            <SignaturePad value={data.sig} onChange={(v) => onChange({ ...data, sig: v })} label="Client signature" />
          </Field>
          {!allDone && (
            <div style={{ padding: 10, background: 'color-mix(in oklab, var(--orange-sunrise) 8%, transparent)', borderRadius: 6, fontSize: 13, color: 'var(--orange-sunrise)' }}>
              Please initial all seven policies above.
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onBack}><Icon name="arrow-left" /> Back</button>
        <button
          className="btn btn-primary btn-lg"
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
          onClick={onNext}
        >
          Next: Work Order <Icon name="arrow-right" />
        </button>
      </div>
    </div>
  );
}

// ── F03 · Work Order / Release ───────────────────────────────────────────────

const ISSUE_TYPES = [
  'AC Adapter', 'CPU', 'Data Recovery', 'Keyboard', 'Fan', 'Hard Drive',
  'Heat Sink', 'Optical Drive (CD/DVD)', 'Operating System', 'PCI Card',
  'RAM', 'System Board', 'Screen', 'Touch Pad', 'Malware',
];

function StepWorkOrder({ data, onChange, onBack, onSubmit, submitting }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const toggleIssue = (t) => set('issues', { ...data.issues, [t]: !data.issues?.[t] });
  const refused = data.warranty === 'yes';
  const valid = data.name && data.email && data.phone && data.warranty && !refused
    && (data.sig || '').length > 100
    && (data.acknowledge || '').trim().length >= 2;

  return (
    <div>
      <div className="form-section">
        <h2>Customer Information</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Full name" required>
              <TextInput value={data.name} onChange={(v) => set('name', v)} placeholder="Full name" />
            </Field>
            <Field label="Student ID" hint="If applicable">
              <TextInput value={data.studentId} onChange={(v) => set('studentId', v)} placeholder="9012345678" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Email" required>
              <TextInput type="email" value={data.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
            </Field>
            <Field label="Phone" required>
              <TextInput type="tel" value={data.phone} onChange={(v) => set('phone', v)} placeholder="(253) 555-0142" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Windows account username" hint="Account name we'll need to log in">
              <TextInput value={data.username} onChange={(v) => set('username', v)} placeholder="e.g. mjordan" />
            </Field>
            <Field label="Password" hint="Leave blank if none">
              <TextInput value={data.password} onChange={(v) => set('password', v)} placeholder="Account password" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Is your computer under warranty?" required hint="If yes, we must refuse work — opening a warrantied device voids manufacturer coverage.">
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill active={data.warranty === 'no'} onClick={() => set('warranty', 'no')}>No</Pill>
                <Pill active={data.warranty === 'yes'} onClick={() => set('warranty', 'yes')} danger>Yes</Pill>
              </div>
            </Field>
            <Field label="Computer language: English?" hint="If no, we'll review accepted languages.">
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill active={data.language === 'yes'} onClick={() => set('language', 'yes')}>Yes</Pill>
                <Pill active={data.language === 'no'} onClick={() => set('language', 'no')}>No</Pill>
              </div>
            </Field>
          </div>
          {refused && (
            <div style={{ padding: 14, background: 'color-mix(in oklab, var(--orange-sunrise) 12%, transparent)', border: '1px solid var(--orange-sunrise)', borderRadius: 8, fontSize: 13 }}>
              <strong>We can't accept this device.</strong> Devices under manufacturer warranty must be returned to the OEM — our work would void coverage. Stop by and we can help you start a warranty claim.
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2>Types of Issues</h2>
        <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>Select all that apply. A technician may adjust after diagnosis.</p>
        <div className="issue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ISSUE_TYPES.map((t) => (
            <IssueChip key={t} active={!!data.issues?.[t]} onClick={() => toggleIssue(t)}>{t}</IssueChip>
          ))}
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <div className="field-row">
            <Field label="Software (specify)">
              <TextInput value={data.software} onChange={(v) => set('software', v)} placeholder="App or OS name and version" />
            </Field>
            <Field label="Other">
              <TextInput value={data.other} onChange={(v) => set('other', v)} placeholder="Anything not listed" />
            </Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Release and Hold Harmless Agreement</h2>
        <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>The Green River PC Repair Shop will not be held liable for ANY services performed on ANY equipment received. Further, if we are unable to repair any equipment received, the Green River PC Repair Shop or its members will not be responsible for replacing hardware, software, or information lost or damaged during diagnostics or repair.</p>
          <h4 style={{ margin: '14px 0 6px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>Acknowledgement of Risk</h4>
          <p style={{ margin: 0 }}>I acknowledge that I have read the above statements and hereby indemnify and hold harmless Green River PC Repair Shop, and its students or advisors, from any liability arising from accident, theft, or damages to all equipment and property. I have received a copy of the Shop Policies and will adhere to them strictly. This agreement shall continue for each visit to Green River PC Repair Shop. The terms of this release shall be governed by the laws of the State of Washington.</p>
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <Field label="Type your full legal name to confirm you have read and agree" required>
            <TextInput value={data.acknowledge} onChange={(v) => set('acknowledge', v)} placeholder="Your full legal name" />
          </Field>
          <div className="field-row">
            <Field label="Date" required>
              <TextInput type="date" value={data.date} onChange={(v) => set('date', v)} />
            </Field>
            <div />
          </div>
          <Field label="Customer signature" required>
            <SignaturePad value={data.sig} onChange={(v) => set('sig', v)} label="Customer signature" />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onBack}><Icon name="arrow-left" /> Back</button>
        <button
          className="btn btn-primary btn-lg"
          disabled={!valid || submitting}
          style={{ opacity: (valid && !submitting) ? 1 : 0.5, cursor: (valid && !submitting) ? 'pointer' : 'not-allowed' }}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit intake'} <Icon name="arrow-right" />
        </button>
      </div>
    </div>
  );
}

// ── Success ──────────────────────────────────────────────────────────────────

function Success({ ticketNumber }) {
  const navigate = useNavigate();
  return (
    <div className="card success-card">
      <div className="check-circle"><Icon name="check" size={32} /></div>
      <h1>Intake submitted</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '48ch', margin: '0 auto' }}>
        Your forms have been received. Please bring your device to <strong>TC-104</strong> during shop hours.
        A technician will complete the Equipment Ledger with you at drop-off.
      </p>
      <div className="success-ticket">
        <span className="label">Ticket Number</span>
        {ticketNumber}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/intake')}>Start another</button>
        <button className="btn btn-primary" onClick={() => navigate('/portal')}>View my tickets</button>
      </div>
    </div>
  );
}

// ── Wizard shell ─────────────────────────────────────────────────────────────

export default function IntakeWizard() {
  const [step, setStep] = useState(0);
  const [issueData, setIssueData] = useState({});
  const [policiesData, setPoliciesData] = useState({ initials: {} });
  const [workOrderData, setWorkOrderData] = useState({ issues: {} });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await ticketsApi.intake({ issueData, policiesData, workOrderData });
      setTicketNumber(data.ticketNumber);
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const advance = () => { setStep((s) => s + 1); window.scrollTo(0, 0); };
  const back = () => { setStep((s) => s - 1); window.scrollTo(0, 0); };

  if (step === 3) {
    return (
      <div className="form-shell">
        <div className="container" style={{ maxWidth: 640 }}>
          <Success ticketNumber={ticketNumber} />
        </div>
      </div>
    );
  }

  return (
    <div className="form-shell">
      <div className="container">
        <div className="form-header">
          <div>
            <h1>New Client Intake</h1>
            <p className="form-lede">Complete all three sections before dropping off your device.</p>
          </div>
        </div>

        <StepBar step={step} />

        {error && (
          <div style={{ marginBottom: 20, padding: 14, background: 'color-mix(in oklab, var(--orange-sunrise) 10%, transparent)', border: '1px solid var(--orange-sunrise)', borderRadius: 8, fontSize: 14, color: 'var(--orange-sunrise)' }}>
            {error}
          </div>
        )}

        {step === 0 && <StepIssue data={issueData} onChange={setIssueData} onNext={advance} />}
        {step === 1 && <StepPolicies data={policiesData} onChange={setPoliciesData} onNext={advance} onBack={back} />}
        {step === 2 && <StepWorkOrder data={workOrderData} onChange={setWorkOrderData} onBack={back} onSubmit={submit} submitting={submitting} />}
      </div>
    </div>
  );
}
