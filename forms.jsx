// GRC Repair Shop — Form chooser + Issue Description + Policies (matches paper forms)

// ---------- Form chooser ----------
const FormChooser = ({ navigate }) => {
  const forms = [
    { id: "F01", route: "form-intake",     title: "Issue Description",       desc: "5 questions about what's wrong, environment, hardware mods, and what you want fixed." },
    { id: "F02", route: "form-policies",   title: "PC Repair Shop Policies", desc: "7 policies — privacy, security, repair, donation, abandonment, backup, software. Initial each." },
    { id: "F03", route: "form-work-order", title: "Work Order / Release & Hold Harmless", desc: "Customer info, types of issues, and the release & hold harmless agreement." },
    { id: "F04", route: "form-equipment",  title: "Equipment Ledger",        desc: "Items received and returned. Initialed by customer and tech at drop-off and at pickup." },
    { id: "F05", route: "form-pickup",     title: "Pick-Up Receipt",         desc: "Summary of repairs performed. Signed at pickup." },
  ];
  return (
    <div className="form-shell">
      <div className="container">
        <div className="form-header">
          <div>
            <h1>Repair Forms</h1>
            <p className="form-lede">All five forms used by the shop. Forms F01–F03 are filled out by you; F04 and F05 are completed jointly with a technician.</p>
          </div>
        </div>
        <div className="grid grid-3">
          {forms.map(f => (
            <button key={f.id} className="form-tile" onClick={() => navigate(f.route)}>
              <span className="tile-id">{f.id}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="arrow">Open form <Icon name="arrow-right" size={14} /></span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }}><Icon name="shield" size={20} /></div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>First time here?</strong> Complete <em>Issue Description</em>, sign <em>Policies</em>, and the <em>Work Order / Release</em>. You'll fill out the Equipment Ledger with a technician at drop-off.
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Form: Issue Description ----------
const FormIssue = ({ navigate, onSubmit }) => {
  const [ticket] = useState(generateTicket);
  const [data, setData] = useState({});
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <FormShell formId="F01 · Issue Description" title="Issue Description / Additional Information" lede="Questions to answer when dropping off your equipment. If a question isn't applicable, write N/A." ticket={ticket} navigate={navigate}>
      <div className="form-section">
        <h2>Your Information</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Client name" required><TextInput value={data.name} onChange={v=>set('name',v)} placeholder="Full name" /></Field>
            <Field label="Email" required><TextInput type="email" value={data.email} onChange={v=>set('email',v)} placeholder="you@example.com" /></Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Questions</h2>
        <div className="field-stack">
          <Field label="1. What problems are you having with the PC / laptop? When did it start occurring?" required>
            <TextArea value={data.q1} onChange={v=>set('q1',v)} rows={4} placeholder="Describe the issue and approximate start date." />
          </Field>
          <Field label="2. Did you download any updates or programs prior to the problem occurring? What programs?">
            <TextArea value={data.q2} onChange={v=>set('q2',v)} rows={3} placeholder="N/A if none." />
          </Field>
          <Field label="3. Has any hardware modification been done to the PC / laptop since purchase? What hardware?" hint="e.g. New battery, new SSD, RAM upgrade.">
            <TextArea value={data.q3} onChange={v=>set('q3',v)} rows={3} placeholder="N/A if none." />
          </Field>
          <Field label="4. What type of environment is the PC or laptop in during daily use?" hint="Humidity, dusty, hot, cold, etc.">
            <TextArea value={data.q4} onChange={v=>set('q4',v)} rows={3} placeholder="e.g. Home desk, mostly indoors, climate controlled." />
          </Field>
          <Field label="5. What do you want resolved on your PC / laptop?" required>
            <TextArea value={data.q5} onChange={v=>set('q5',v)} rows={4} placeholder="e.g. Get it to boot, remove malware, faster startup." />
          </Field>
          <Field label="Additional Information">
            <TextArea value={data.additional} onChange={v=>set('additional',v)} rows={4} placeholder="Anything else we should know." />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => navigate("forms")}><Icon name="arrow-left" /> Back to forms</button>
        <button className="btn btn-primary btn-lg" onClick={() => onSubmit("Issue Description", ticket, data)}>Submit <Icon name="arrow-right" /></button>
      </div>
    </FormShell>
  );
};

// ---------- Form: Policies (1-7, each initialed) ----------
const POLICIES = [
  {
    n: 1, key: "privacy", title: "Privacy Policy",
    body: "The staff of the Green River PC Repair Shop will exercise due care to secure your personal information / computer data. We do not sell, trade, or transfer to outside parties any of your personal information or computer data."
  },
  {
    n: 2, key: "security", title: "Security Policy",
    body: "The staff of the Green River PC Repair Shop will do everything within our power to secure your personal property. We do not sell, trade, or transfer to outside parties any of the equipment you bring in for repair."
  },
  {
    n: 3, key: "repair", title: "Repair Policy",
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li>The staff will do everything within our abilities to repair your equipment, however not all computer equipment can be repaired at this location. We are a student-run facility and have limited access to diagnostic / repair equipment. If we cannot repair a computer, we will give a full explanation of the situation and provide information detailing our findings.</li>
        <li>We do not have the ability to order computer parts / software if required for a repair. We are happy to provide you with the information needed to purchase computer parts / software for your computer. We are willing to install the computer parts / software you provide at no further cost to you.</li>
        <li>The staff of the Green River PC Repair Shop is not liable for any voided warranties that may arise as a result of any work done on any equipment brought into the shop for repair.</li>
        <li>The services provided by the Green River PC Repair Shop are intended for individuals and owners of the equipment to be repaired.</li>
        <li>All repairs are done on a first come, first served basis. The staff cannot guarantee or accommodate a specific date / time for completion of repairs.</li>
      </ul>
    )
  },
  {
    n: 4, key: "donation", title: "Donation Policy",
    body: "A donation to the shop is greatly appreciated but not required! Donations can be accepted anytime during the process and pay for shop supplies and software for diagnosing system issues."
  },
  {
    n: 5, key: "abandoned", title: "Abandoned Property",
    body: "Upon completion of work, Green River PC Repair Shop will contact the owner of the equipment. If equipment is not picked up within 180 days after contact, all equipment will be considered abandoned, and will be recycled. Green River PC Repair Shop will make due effort to ensure you are contacted by phone and / or by email when your equipment has been repaired."
  },
  {
    n: 6, key: "backup", title: "Backup Policy",
    body: "If you want a backup of your files for personal use, the Green River PC Repair Shop will need you to supply the storage media for the backup (Examples: flash drive, external hard drive, etc.)."
  },
  {
    n: 7, key: "software", title: "Software Policy",
    body: "The Green River PC Repair Shop will only work on legitimate installations of Windows OS. Any computer found to have an unofficial copy of Windows operating system will be returned immediately without any further repair."
  },
];

const FormPolicies = ({ navigate, onSubmit }) => {
  const [ticket] = useState(generateTicket);
  const [data, setData] = useState({ initials: {} });
  const setInitial = (key, v) => setData(d => ({ ...d, initials: { ...d.initials, [key]: v } }));
  const allInitialed = POLICIES.every(p => (data.initials[p.key] || "").trim().length >= 2);

  return (
    <FormShell formId="F02 · Policies" title="PC Repair Shop Policies" lede="Read each policy and place your initials in the box. All seven are required before we can perform any work." ticket={ticket} navigate={navigate}>
      <div className="form-section">
        <h2>Client</h2>
        <div className="field-stack">
          <div className="field-row">
            <Field label="Full legal name" required><TextInput value={data.name} onChange={v=>setData(d=>({...d,name:v}))} placeholder="Your full name" /></Field>
            <Field label="Date" required><TextInput type="date" value={data.date} onChange={v=>setData(d=>({...d,date:v}))} /></Field>
          </div>
        </div>
      </div>

      {POLICIES.map(p => (
        <div className="form-section" key={p.key}>
          <h2><span style={{color:'var(--accent)'}}>{p.n}.</span> &nbsp;{p.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start' }} className="policy-grid">
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{p.body}</div>
            <div style={{ width: 120 }}>
              <Field label="Initial" required>
                <TextInput
                  value={data.initials[p.key] || ""}
                  onChange={v => setInitial(p.key, v.toUpperCase().slice(0, 4))}
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
        <Field label="Client signature" required>
          <SignaturePad value={data.sig} onChange={v=>setData(d=>({...d,sig:v}))} label="Client signature" />
        </Field>
        {!allInitialed && (
          <div style={{ marginTop: 14, padding: 10, background: 'color-mix(in oklab, var(--orange-sunrise) 8%, transparent)', borderRadius: 6, fontSize: 13, color: 'var(--orange-sunrise)' }}>
            Please initial all seven policies above.
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => navigate("forms")}><Icon name="arrow-left" /> Back to forms</button>
        <button className="btn btn-primary btn-lg" disabled={!allInitialed} style={{ opacity: allInitialed ? 1 : 0.5, cursor: allInitialed ? 'pointer' : 'not-allowed' }} onClick={() => onSubmit("Policies Acknowledgment", ticket, data)}>Submit acknowledgment <Icon name="arrow-right" /></button>
      </div>
    </FormShell>
  );
};

Object.assign(window, { FormChooser, FormIssue, FormPolicies });
