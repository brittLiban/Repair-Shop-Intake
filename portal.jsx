// GRC Repair Shop — Customer portal (login + my tickets)

const CUSTOMER_TICKETS = [
  {
    id: "GRC-260508-4421",
    device: "Dell XPS 15 9520",
    serial: "5CG2347JK9",
    submitted: "May 8, 2026",
    status: "in-progress",
    statusLabel: "In repair",
    technician: "M. Alvarez",
    summary: "Won't boot past BIOS, fan running constantly.",
    updates: [
      { when: "May 11 · 14:20", text: "Reseated RAM and ran extended diagnostic. SSD reports healthy. Reinstalling Windows next." },
      { when: "May 10 · 11:05", text: "Diagnosis started. Thermal paste replacement scheduled." },
      { when: "May 8 · 09:42", text: "Equipment received. Drop-off ledger signed." },
    ],
  },
  {
    id: "GRC-260322-8812",
    device: "HP Pavilion Desktop",
    serial: "MXL3214Q7P",
    submitted: "Mar 22, 2026",
    status: "complete",
    statusLabel: "Ready for pickup",
    technician: "J. Tran",
    summary: "Malware cleanup + OS reinstall.",
    updates: [
      { when: "Mar 26 · 15:10", text: "Repairs complete. Ready for pickup at TC-104 during shop hours." },
      { when: "Mar 24 · 13:00", text: "Malware removed. Fresh Windows install in progress." },
    ],
  },
];

// ---------- Login ----------
const PortalLogin = ({ navigate, onLogin }) => {
  const [mode, setMode] = useState("signin");
  const [data, setData] = useState({});
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const submit = (e) => {
    e?.preventDefault();
    if (!data.email) return;
    onLogin({
      name: data.name || data.email.split("@")[0],
      email: data.email,
      studentId: data.studentId || "",
      joined: new Date().toISOString(),
    });
  };

  return (
    <div className="form-shell">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>G</span>
          </div>
          <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 6 }}>{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            {mode === "signin"
              ? "Track repairs, get update notifications, and access your filed forms."
              : "Set up an account to follow your repair from drop-off to pickup."}
          </p>

          <form onSubmit={submit}>
            <div className="field-stack">
              {mode === "signup" && (
                <>
                  <Field label="Full name" required><TextInput value={data.name} onChange={v=>set('name',v)} placeholder="Jordan Smith" /></Field>
                  <Field label="Student ID" hint="Optional — used to look up class enrollment"><TextInput value={data.studentId} onChange={v=>set('studentId',v)} placeholder="9012345678" /></Field>
                </>
              )}
              <Field label="Email" required><TextInput type="email" value={data.email} onChange={v=>set('email',v)} placeholder="you@greenriver.edu" /></Field>
              <Field label="Password" required><TextInput type="password" value={data.password} onChange={v=>set('password',v)} placeholder="••••••••" /></Field>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}>
              {mode === "signin" ? "Sign in" : "Create account"} <Icon name="arrow-right" />
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            {mode === "signin" ? (
              <>New here? <a href="#" onClick={e => { e.preventDefault(); setMode("signup"); }} style={{ color: 'var(--accent)' }}>Create an account</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("signin"); }} style={{ color: 'var(--accent)' }}>Sign in</a></>
            )}
          </div>

          <div style={{ marginTop: 24, padding: 12, background: 'var(--surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Drop-off doesn't require an account — but signing in lets you check status without calling the shop.
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Portal (my tickets) ----------
const Portal = ({ user, onSignOut, navigate }) => {
  const [selected, setSelected] = useState(CUSTOMER_TICKETS[0].id);
  const ticket = CUSTOMER_TICKETS.find(t => t.id === selected);

  return (
    <div className="form-shell">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span> Customer portal
            </div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Hi, {user.name.split(' ')[0]}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {CUSTOMER_TICKETS.filter(t => t.status === "in-progress").length} active repair · {CUSTOMER_TICKETS.filter(t => t.status === "complete").length} ready for pickup
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate("forms")}>
              <Icon name="plus" /> Start new repair
            </button>
            <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
          </div>
        </div>

        <div className="ticket-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 4 }}>Your tickets</h3>
            {CUSTOMER_TICKETS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                style={{
                  textAlign: 'left', padding: 16, borderRadius: 10,
                  border: '1px solid ' + (selected === t.id ? 'var(--accent)' : 'var(--border)'),
                  background: selected === t.id ? 'color-mix(in oklab, var(--accent) 6%, var(--surface))' : 'var(--surface)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: selected === t.id ? '0 0 0 3px color-mix(in oklab, var(--accent) 14%, transparent)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>{t.id}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{t.device}</div>
                <StatusBadge status={t.status}>{t.statusLabel}</StatusBadge>
              </button>
            ))}
          </div>

          <TicketDetail ticket={ticket} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, children }) => {
  const colors = {
    "in-progress": { bg: 'color-mix(in oklab, var(--blue-sky) 16%, transparent)', fg: 'var(--blue-sky)', dot: 'var(--blue-sky)' },
    "complete":    { bg: 'color-mix(in oklab, var(--accent) 16%, transparent)', fg: 'var(--accent)', dot: 'var(--accent)' },
    "waiting":     { bg: 'color-mix(in oklab, var(--orange-sunrise) 16%, transparent)', fg: 'var(--orange-sunrise)', dot: 'var(--orange-sunrise)' },
    "new":         { bg: 'var(--surface-2)', fg: 'var(--text-muted)', dot: 'var(--text-soft)' },
  };
  const c = colors[status] || colors.new;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }}></span>
      {children}
    </span>
  );
};

const TicketDetail = ({ ticket }) => {
  if (!ticket) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Select a ticket to view details.</div>;

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 6 }}>{ticket.id}</div>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>{ticket.device}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{ticket.summary}</p>
        </div>
        <StatusBadge status={ticket.status}>{ticket.statusLabel}</StatusBadge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <Stat label="Submitted" value={ticket.submitted} />
        <Stat label="Technician" value={ticket.technician} />
        <Stat label="Serial #" value={ticket.serial} mono />
      </div>

      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 14 }}>Updates</h3>
      <div style={{ position: 'relative', paddingLeft: 22 }}>
        <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--border)' }}></div>
        {ticket.updates.map((u, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
            <span style={{ position: 'absolute', left: -22, top: 4, width: 13, height: 13, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--surface)', border: '2px solid ' + (i === 0 ? 'var(--accent)' : 'var(--border-strong)') }}></span>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 4 }}>{u.when}</div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{u.text}</div>
          </div>
        ))}
      </div>

      {ticket.status === "complete" && (
        <div style={{ marginTop: 20, padding: 16, background: 'color-mix(in oklab, var(--accent) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, color: 'var(--text)' }}>
            <strong>Ready for pickup</strong> — TC-104, during shop hours. Bring photo ID.
          </div>
          <button className="btn btn-primary btn-sm">Get directions</button>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, mono }) => (
  <div style={{ background: 'var(--surface)', padding: '14px 16px' }}>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-soft)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
  </div>
);

Object.assign(window, { PortalLogin, Portal });
