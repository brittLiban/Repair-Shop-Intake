// GRC Repair Shop — shared components (header, footer, form primitives, signature pad)

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------- Icons (minimal stroke set) ----------
const Icon = ({ name, size = 16 }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "arrow-right": return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "arrow-left": return <svg {...common}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case "check": return <svg {...common}><path d="M5 12l5 5L20 7"/></svg>;
    case "x": return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "pin": return <svg {...common}><path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "phone": return <svg {...common}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>;
    case "mail": return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "upload": return <svg {...common}><path d="M12 3v12M7 8l5-5 5 5M5 21h14"/></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "filter": return <svg {...common}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "device": return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>;
    case "wrench": return <svg {...common}><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.3 2.3-2.4-2.4z"/></svg>;
    case "shield": return <svg {...common}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>;
    case "doc": return <svg {...common}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>;
    case "sun": return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    case "moon": return <svg {...common}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
    default: return null;
  }
};

// ---------- Header ----------
const Header = ({ route, navigate, user, onSignOut }) => {
  const links = [
    { id: "home", label: "Home" },
    { id: "forms", label: "Forms" },
    { id: "dashboard", label: "Dashboard" },
  ];
  return (
    <header className="site-header">
      <div className="container bar">
        <button className="brand" onClick={() => navigate("home")} style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}>
          <span className="mark">G</span>
          <span className="name">Green River PC Repair Shop</span>
        </button>
        <nav className="nav">
          {links.map(l => (
            <button
              key={l.id}
              className="nav-link always"
              aria-current={route.startsWith(l.id) ? "page" : undefined}
              onClick={() => navigate(l.id)}
            >
              {l.label}
            </button>
          ))}
          {user ? (
            <button className="btn-signin" onClick={() => navigate("portal")} style={{ marginLeft: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {(user.name || user.email)[0].toUpperCase()}
                </span>
                My tickets
              </span>
            </button>
          ) : (
            <button className="btn-signin primary" onClick={() => navigate("portal")} style={{ marginLeft: 8 }}>
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

// ---------- Footer ----------
const Footer = () => (
  <footer className="footer">
    <div className="container row">
      <div>
        <strong style={{ color: "var(--text)" }}>Green River PC Repair Shop</strong> &nbsp;·&nbsp; Green River College &nbsp;·&nbsp; IT Department
      </div>
      <div className="links">
        <a href="#" onClick={e=>e.preventDefault()}>Privacy</a>
        <a href="#" onClick={e=>e.preventDefault()}>Accessibility</a>
        <a href="#" onClick={e=>e.preventDefault()}>Contact</a>
      </div>
    </div>
  </footer>
);

// ---------- Form primitives ----------
const Field = ({ label, required, hint, children, htmlFor }) => (
  <div className="field">
    {label && (
      <label className="label" htmlFor={htmlFor}>
        {label}{required && <span className="required">*</span>}
      </label>
    )}
    {children}
    {hint && <div className="hint">{hint}</div>}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", id, ...rest }) => (
  <input
    id={id}
    className="input"
    type={type}
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    {...rest}
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 4, id }) => (
  <textarea
    id={id}
    className="textarea"
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
  />
);

const Select = ({ value, onChange, options, id, placeholder }) => (
  <select id={id} className="select" value={value || ""} onChange={e => onChange(e.target.value)}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => (
      <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
        {typeof o === "string" ? o : o.label}
      </option>
    ))}
  </select>
);

const Checkbox = ({ checked, onChange, label, description }) => (
  <label className="check">
    <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
    <div className="check-body">
      <span>{label}</span>
      {description && <small>{description}</small>}
    </div>
  </label>
);

// ---------- Signature Pad ----------
const SignaturePad = ({ value, onChange, label = "Signature" }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const [hasInk, setHasInk] = useState(!!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#1A1A18";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Re-draw existing
      if (value) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = value;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line
  }, []);

  const getPt = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = getPt(e);
    setHasInk(true);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const pt = getPt(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (onChange && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange && onChange("");
  };

  return (
    <div>
      <div className="sig-pad">
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {!hasInk && (
          <>
            <span className="sig-x">×</span>
            <span className="sig-label">{label}</span>
          </>
        )}
      </div>
      <div className="sig-tools">
        <span className="sig-hint">Sign with mouse, trackpad, or finger</span>
        <button className="btn btn-ghost btn-sm" onClick={clear} type="button">Clear</button>
      </div>
    </div>
  );
};

// ---------- File upload ----------
const PhotoUpload = ({ files, onChange, max = 6 }) => {
  const inputRef = useRef(null);
  const handlePick = (e) => {
    const list = Array.from(e.target.files || []).slice(0, max - (files?.length || 0));
    const items = list.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB" }));
    onChange([...(files || []), ...items]);
    e.target.value = "";
  };
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="upload" onClick={() => inputRef.current?.click()} onKeyDown={e => e.key === "Enter" && inputRef.current?.click()} role="button" tabIndex={0}>
        <div className="upload-icon"><Icon name="upload" size={22} /></div>
        <div className="upload-text">Click to upload photos of device condition</div>
        <div className="upload-sub">PNG, JPG up to 10MB each · {max - (files?.length || 0)} remaining</div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePick} />
      </div>
      {files && files.length > 0 && (
        <div className="upload-list">
          {files.map((f, i) => (
            <div className="upload-item" key={i}>
              <Icon name="doc" size={14} />
              <span className="filename">{f.name}</span>
              <span style={{ color: "var(--text-soft)" }}>{f.size}</span>
              <span className="x" onClick={() => remove(i)} role="button">×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Form shell ----------
const FormShell = ({ formId, title, lede, ticket, children, navigate }) => (
  <div className="form-shell">
    <div className="container">
      <div className="breadcrumbs">
        <a href="#" onClick={e => { e.preventDefault(); navigate("forms"); }}>Forms</a>
        <span className="sep">/</span>
        <span style={{ color: "var(--text-muted)" }}>{formId}</span>
      </div>
      <div className="form-header">
        <div>
          <h1>{title}</h1>
          {lede && <p className="form-lede">{lede}</p>}
        </div>
        {ticket && (
          <div className="ticket">
            Ticket <strong>{ticket}</strong> &nbsp;·&nbsp; Draft
          </div>
        )}
      </div>
      {children}
    </div>
  </div>
);

// ---------- Submission success ----------
const SubmissionSuccess = ({ formTitle, ticket, onAnother, onHome }) => (
  <div className="form-shell">
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="card success-card">
        <div className="check-circle"><Icon name="check" size={32} /></div>
        <h1>{formTitle} submitted</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 48 + "ch", margin: "0 auto" }}>
          Thank you. A copy has been sent to the email you provided. Bring this ticket number when you drop off or pick up your device.
        </p>
        <div className="success-ticket">
          <span className="label">Ticket Number</span>
          {ticket}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={onAnother}>File another form</button>
          <button className="btn btn-primary" onClick={onHome}>Return home</button>
        </div>
      </div>
    </div>
  </div>
);

// Ticket generator
const generateTicket = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `GRC-${yy}${mm}${dd}-${rand}`;
};

Object.assign(window, {
  Icon, Header, Footer,
  Field, TextInput, TextArea, Select, Checkbox,
  SignaturePad, PhotoUpload,
  FormShell, SubmissionSuccess,
  generateTicket,
});
