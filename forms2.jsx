// GRC Repair Shop — Work Order, Equipment Ledger, Pick-Up Receipt

const ISSUE_TYPES = [
  "AC Adapter", "CPU", "Data Recovery",
  "Keyboard", "Fan", "Hard Drive",
  "Heat Sink", "Optical Drive (CD/DVD)", "Operating System",
  "PCI Card", "RAM", "System Board",
  "Screen", "Touch Pad", "Malware",
];

// ---------- F03 · Work Order / Release & Hold Harmless ----------
const FormWorkOrder = ({ navigate, onSubmit }) => {
  const [ticket] = useState(generateTicket);
  const [data, setData] = useState({ issues: {}, warranty: "", language: "" });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggleIssue = (k) => setData(d => ({ ...d, issues: { ...d.issues, [k]: !d.issues[k] } }));

  const refused = data.warranty === "yes";
  const canSubmit = data.name && data.email && data.warranty && !refused && (data.sig || "").length > 100 && (data.acknowledge || "").trim().length >= 2;

  return (
    <FormShell formId="F03 · Work Order / Release" title="Work Order / Release & Hold Harmless Agreement" lede="Customer information, types of issues, and release of liability. Customer sections only — the Office Use section is completed by your technician." ticket={ticket} navigate={navigate}>
      <div className="form-section">
        <h2>Customer Information</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Client name" required><TextInput value={data.name} onChange={v=>set('name',v)} placeholder="Full name" /></Field>
            <Field label="Student ID" hint="If applicable"><TextInput value={data.studentId} onChange={v=>set('studentId',v)} placeholder="e.g. 901234567" /></Field>
          </div>
          <div className="field-row">
            <Field label="Email" required><TextInput type="email" value={data.email} onChange={v=>set('email',v)} placeholder="you@example.com" /></Field>
            <Field label="Phone number" required><TextInput type="tel" value={data.phone} onChange={v=>set('phone',v)} placeholder="(253) 555-0142" /></Field>
          </div>
          <div className="field-row">
            <Field label="User name on PC" hint="The Windows account name we'll need to log in"><TextInput value={data.username} onChange={v=>set('username',v)} placeholder="e.g. mjordan" /></Field>
            <Field label="Password" hint="Leave blank if there is no password"><TextInput type="text" value={data.password} onChange={v=>set('password',v)} placeholder="Account password" /></Field>
          </div>
          <div className="field-row">
            <Field label="Is your computer under warranty?" required hint="If yes, we must refuse work — opening a warrantied machine voids coverage.">
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill active={data.warranty === "no"} onClick={() => set('warranty', 'no')}>No</Pill>
                <Pill active={data.warranty === "yes"} onClick={() => set('warranty', 'yes')} danger>Yes</Pill>
              </div>
            </Field>
            <Field label="Computer language: English?" hint="If no, we'll review accepted languages or consult a manager.">
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill active={data.language === "yes"} onClick={() => set('language', 'yes')}>Yes</Pill>
                <Pill active={data.language === "no"} onClick={() => set('language', 'no')}>No</Pill>
              </div>
            </Field>
          </div>
          {refused && (
            <div style={{ padding: 12, background: 'color-mix(in oklab, var(--orange-sunrise) 12%, transparent)', border: '1px solid var(--orange-sunrise)', borderRadius: 8, fontSize: 13, color: 'var(--text)' }}>
              <strong>We can't accept this device.</strong> Devices under manufacturer warranty must be returned to the OEM — our work would void coverage. Stop by and we can help you start a warranty claim.
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2>Types of Issues</h2>
        <p className="section-lede" style={{ marginBottom: 16 }}>Select everything that applies. A technician may adjust this after diagnosis.</p>
        <div className="issue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ISSUE_TYPES.map(t => (
            <IssueChip key={t} active={!!data.issues[t]} onClick={() => toggleIssue(t)}>{t}</IssueChip>
          ))}
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <div className="field-row">
            <Field label="Software (specify)"><TextInput value={data.software} onChange={v=>set('software',v)} placeholder="App or OS name and version" /></Field>
            <Field label="Other"><TextInput value={data.other} onChange={v=>set('other',v)} placeholder="Anything not listed above" /></Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Release and Hold Harmless Agreement</h2>
        <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, lineHeight: 1.65, color: 'var(--text)' }}>
          <p style={{ margin: 0 }}>The Green River PC Repair Shop will not be held liable for ANY services performed on ANY equipment received by the Party or Parties below. Further, if we are unable to repair any equipment received, the Green River PC Repair Shop or its members will not be responsible for replacing hardware, software, or information lost or damaged during diagnostics of, and / or repairing of the equipment received from any intended parties.</p>
          <h4 style={{ margin: '14px 0 6px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>Acknowledgement of Risk</h4>
          <p style={{ margin: 0 }}>I acknowledge that I have read the above statements and definitions, and hereby indemnify and hold harmless Green River PC Repair Shop, and its students or advisors, from any liability arising from accident, theft, or damages to all equipment and property. I have received a copy of Green River PC Repair Shop's Policies and will adhere to them strictly. This agreement shall continue for each and every visit to Green River PC Repair Shop's property. The terms of this release shall be governed by the laws of the State of Washington.</p>
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <Field label="Type your full name to confirm you have read and agree" required>
            <TextInput value={data.acknowledge} onChange={v=>set('acknowledge',v)} placeholder="Your full legal name" />
          </Field>
          <div className="field-row">
            <Field label="Date" required><TextInput type="date" value={data.date} onChange={v=>set('date',v)} /></Field>
            <div></div>
          </div>
          <Field label="Customer signature" required>
            <SignaturePad value={data.sig} onChange={v=>set('sig',v)} label="Customer signature" />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => navigate("forms")}><Icon name="arrow-left" /> Back to forms</button>
        <button className="btn btn-primary btn-lg" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }} onClick={() => onSubmit("Work Order / Release", ticket, data)}>Submit work order <Icon name="arrow-right" /></button>
      </div>
    </FormShell>
  );
};

// ---------- F04 · Equipment Ledger ----------
const LEDGER_ITEMS = ["PC / Laptop", "Power Supply", "External HD", "Flash Drive(s)", "Mouse", "Software", "Screen", "Operating System", "Other"];

const FormEquipment = ({ navigate, onSubmit }) => {
  const [ticket] = useState(generateTicket);
  const [data, setData] = useState({ items: {} });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setItem = (item, col, v) => setData(d => ({ ...d, items: { ...d.items, [item]: { ...d.items[item], [col]: v } } }));
  const noteItem = (item, v) => setItem(item, 'note', v);

  const acknowledged = (data.acknowledge || "").trim().length >= 2;
  const canSubmit = acknowledged && (data.dropSig || "").length > 100;

  return (
    <FormShell formId="F04 · Equipment Ledger" title="Ledger of Equipment Received and Returned" lede="Initial each item dropped off, then again at pickup. The technician completes their column with you in person." ticket={ticket} navigate={navigate}>
      <div className="form-section">
        <h2>Acknowledgement</h2>
        <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, lineHeight: 1.65, color: 'var(--text)' }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>I, <span style={{ borderBottom: '1px solid var(--accent)', padding: '0 6px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{data.acknowledge || "_____________________"}</span></strong>,
            acknowledge that I have received all of my equipment which was brought in to the Green River PC Repair Shop for repair.
          </p>
          <p style={{ margin: '10px 0 0' }}>I hereby acknowledge that the diagnostic work or repair and the services provided were done to my satisfaction. I also recognize that it is my responsibility to inform Green River PC Repair Shop of any other faults or defects at the time of pickup of equipment. I have picked up all items left by me (the customer) at TC-105. Any items not picked up I authorize Green River PC Repair Shop to throw out / destroy / recycle within 90 days. Claims of damage done by the work (dents, scratches, etcetera) must be made at the pickup time and not after. Claims made after pick up are null and void. The unit and all accessories are now in my (the customer's) possession. No warranty is expressed or implied.</p>
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <Field label="Type your full name to acknowledge" required>
            <TextInput value={data.acknowledge} onChange={v=>set('acknowledge',v)} placeholder="Your full legal name" />
          </Field>
          <div className="field-row">
            <Field label="Receipt #" hint="Provided by the shop"><TextInput value={data.receipt || ticket} onChange={v=>set('receipt',v)} /></Field>
            <Field label="PC Serial #"><TextInput value={data.serial} onChange={v=>set('serial',v)} placeholder="Manufacturer S/N" /></Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Items</h2>
        <p className="section-lede" style={{ marginBottom: 16 }}>For every item present, initial the Drop-Off column. Pickup initials are added when you collect the device.</p>
        <div className="ledger-table">
          <div className="ledger-row ledger-head">
            <div>Item</div>
            <div className="group" data-color="drop">Drop-Off · Customer</div>
            <div className="group" data-color="drop">Drop-Off · Tech</div>
            <div className="group" data-color="pick">Pick-Up · Customer</div>
            <div className="group" data-color="pick">Pick-Up · Tech</div>
            <div>Notes</div>
          </div>
          {LEDGER_ITEMS.map(item => (
            <div className="ledger-row" key={item}>
              <div className="item-name">{item}</div>
              <InitialCell value={data.items[item]?.dropCust} onChange={v => setItem(item, 'dropCust', v)} />
              <InitialCell value={data.items[item]?.dropTech} onChange={v => setItem(item, 'dropTech', v)} disabled hint="Tech" />
              <InitialCell value={data.items[item]?.pickCust} onChange={v => setItem(item, 'pickCust', v)} disabled hint="Pickup" />
              <InitialCell value={data.items[item]?.pickTech} onChange={v => setItem(item, 'pickTech', v)} disabled hint="Tech" />
              <TextInput value={data.items[item]?.note || ""} onChange={v => noteItem(item, v)} placeholder="Optional" />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>Drop-Off Signatures</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Date" required><TextInput type="date" value={data.dropDate} onChange={v=>set('dropDate',v)} /></Field>
            <div></div>
          </div>
          <Field label="Customer signature (drop-off)" required>
            <SignaturePad value={data.dropSig} onChange={v=>set('dropSig',v)} label="Drop-off customer signature" />
          </Field>
          <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <Icon name="shield" size={13} /> &nbsp; Drop-off tech signature, pickup customer signature, and pickup tech signature are collected later, in person, at the shop.
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => navigate("forms")}><Icon name="arrow-left" /> Back to forms</button>
        <button className="btn btn-primary btn-lg" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }} onClick={() => onSubmit("Equipment Ledger", ticket, data)}>Submit ledger <Icon name="arrow-right" /></button>
      </div>
    </FormShell>
  );
};

// ---------- F05 · Pick-Up Receipt ----------
const REPAIR_TYPES = [
  "Software Reloaded", "Data Recovery", "Hard Drive",
  "Optical Drive (CD/DVD)", "System Board", "RAM Memory",
  "Heat Sink", "CPU", "Keyboard",
  "Touch Pad", "PCI Card", "Fan",
  "Screen", "AC Adapter", "Malware",
];

const FormPickup = ({ navigate, onSubmit }) => {
  const [ticket] = useState(generateTicket);
  const [data, setData] = useState({ repairs: {}, status: "" });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggleRepair = (k) => setData(d => ({ ...d, repairs: { ...d.repairs, [k]: !d.repairs[k] } }));

  const canSubmit = data.name && data.receipt && data.status && (data.sig || "").length > 100;

  return (
    <FormShell formId="F05 · Pick-Up Receipt" title="Pick-Up Receipt" lede="Confirm what was repaired and acknowledge return of your equipment. Completed jointly with a technician at pickup." ticket={ticket} navigate={navigate}>
      <div className="form-section">
        <h2>Pickup Details</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Client name" required><TextInput value={data.name} onChange={v=>set('name',v)} placeholder="Full name" /></Field>
            <Field label="Receipt number" required><TextInput value={data.receipt} onChange={v=>set('receipt',v)} placeholder="e.g. GRC-260511-1234" /></Field>
          </div>
          <div className="field-row">
            <Field label="Prepared by"><TextInput value={data.preparedBy} onChange={v=>set('preparedBy',v)} placeholder="Technician name" /></Field>
            <Field label="Pickup tech"><TextInput value={data.pickupTech} onChange={v=>set('pickupTech',v)} placeholder="Technician name" /></Field>
          </div>
          <Field label="Your product has been:" required>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Pill active={data.status === "repaired"} onClick={() => set('status', 'repaired')}>Repaired</Pill>
              <Pill active={data.status === "not-repaired"} onClick={() => set('status', 'not-repaired')}>Returned, not repaired</Pill>
              <Pill active={data.status === "other"} onClick={() => set('status', 'other')}>Other</Pill>
            </div>
          </Field>
        </div>
      </div>

      <div className="form-section">
        <h2>Summary of Repairs</h2>
        <p className="section-lede" style={{ marginBottom: 16 }}>Mark every category that was worked on during this visit.</p>
        <div className="issue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {REPAIR_TYPES.map(t => (
            <IssueChip key={t} active={!!data.repairs[t]} onClick={() => toggleRepair(t)}>{t}</IssueChip>
          ))}
        </div>
        <div className="field-stack" style={{ marginTop: 18 }}>
          <Field label="Other"><TextInput value={data.repairOther} onChange={v=>set('repairOther',v)} placeholder="Anything not listed above" /></Field>
        </div>
      </div>

      <div className="form-section">
        <h2>Additional Information Customer Needs to Know</h2>
        <Field label="Notes from your technician">
          <TextArea value={data.notes} onChange={v=>set('notes',v)} rows={8} placeholder="What we found, what we did, what to watch for going forward, recommendations." />
        </Field>
      </div>

      <div className="form-section">
        <h2>Signatures</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Date" required><TextInput type="date" value={data.date} onChange={v=>set('date',v)} /></Field>
            <div></div>
          </div>
          <Field label="Customer signature" required>
            <SignaturePad value={data.sig} onChange={v=>set('sig',v)} label="Customer signature" />
          </Field>
          <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <Icon name="shield" size={13} /> &nbsp; Technician signature is added on the shop tablet at the time of pickup.
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => navigate("forms")}><Icon name="arrow-left" /> Back to forms</button>
        <button className="btn btn-primary btn-lg" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }} onClick={() => onSubmit("Pick-Up Receipt", ticket, data)}>Submit receipt <Icon name="arrow-right" /></button>
      </div>
    </FormShell>
  );
};

// ---------- Tiny atoms used above ----------
const Pill = ({ active, onClick, children, danger }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      height: 36, padding: '0 16px', borderRadius: 999,
      border: '1px solid ' + (active ? (danger ? 'var(--orange-sunrise)' : 'var(--accent)') : 'var(--border-strong)'),
      background: active ? (danger ? 'color-mix(in oklab, var(--orange-sunrise) 14%, transparent)' : 'color-mix(in oklab, var(--accent) 14%, transparent)') : 'var(--surface)',
      color: active ? (danger ? 'var(--orange-sunrise)' : 'var(--accent)') : 'var(--text)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    }}
  >{children}</button>
);

const IssueChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      height: 44, padding: '0 14px', borderRadius: 8,
      border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
      background: active ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : 'var(--surface)',
      color: active ? 'var(--accent)' : 'var(--text)',
      fontSize: 13.5, fontWeight: active ? 600 : 500,
      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 10,
    }}
  >
    <span style={{
      width: 16, height: 16, borderRadius: 4,
      border: '1.5px solid ' + (active ? 'var(--accent)' : 'var(--border-strong)'),
      background: active ? 'var(--accent)' : 'transparent',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      {active && <Icon name="check" size={11} />}
    </span>
    {children}
  </button>
);

const InitialCell = ({ value, onChange, disabled, hint }) => (
  <input
    type="text"
    className="input"
    value={value || ""}
    onChange={e => onChange(e.target.value.toUpperCase().slice(0, 4))}
    placeholder={disabled ? (hint || "—") : "XX"}
    disabled={disabled}
    style={{
      textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em',
      height: 36, padding: '0 8px',
      opacity: disabled ? 0.45 : 1,
      background: disabled ? 'var(--surface-2)' : 'var(--surface)',
    }}
  />
);

Object.assign(window, { FormWorkOrder, FormEquipment, FormPickup });
