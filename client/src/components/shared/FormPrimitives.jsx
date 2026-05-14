export function Field({ label, required, hint, children, htmlFor }) {
  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', id, ...rest }) {
  return (
    <input
      id={id}
      className="input"
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 4, id }) {
  return (
    <textarea
      id={id}
      className="textarea"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

export function Select({ value, onChange, options, id, placeholder }) {
  return (
    <select
      id={id}
      className="select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option
          key={typeof o === 'string' ? o : o.value}
          value={typeof o === 'string' ? o : o.value}
        >
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

export function Pill({ active, onClick, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 36,
        padding: '0 16px',
        borderRadius: 999,
        border: '1px solid ' + (active
          ? (danger ? 'var(--orange-sunrise)' : 'var(--accent)')
          : 'var(--border-strong)'),
        background: active
          ? (danger
            ? 'color-mix(in oklab, var(--orange-sunrise) 14%, transparent)'
            : 'color-mix(in oklab, var(--accent) 14%, transparent)')
          : 'var(--surface)',
        color: active
          ? (danger ? 'var(--orange-sunrise)' : 'var(--accent)')
          : 'var(--text)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

export function IssueChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44,
        padding: '0 14px',
        borderRadius: 8,
        border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
        background: active
          ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
          : 'var(--surface)',
        color: active ? 'var(--accent)' : 'var(--text)',
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: '1.5px solid ' + (active ? 'var(--accent)' : 'var(--border-strong)'),
        background: active ? 'var(--accent)' : 'transparent',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}>
        {active && (
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}
