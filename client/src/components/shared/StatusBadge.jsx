const STATUS_STYLES = {
  new:             { bg: 'color-mix(in oklab, var(--orange-sunrise) 14%, transparent)', fg: 'var(--orange-sunrise)' },
  diagnosed:       { bg: 'color-mix(in oklab, var(--blue-sky) 14%, transparent)',       fg: 'var(--blue-sky)'       },
  'in-repair':     { bg: 'color-mix(in oklab, var(--blue-sky) 14%, transparent)',       fg: 'var(--blue-sky)'       },
  'awaiting-parts':{ bg: 'var(--surface-2)',                                             fg: 'var(--text-muted)'    },
  ready:           { bg: 'color-mix(in oklab, var(--accent) 14%, transparent)',          fg: 'var(--accent)'        },
  closed:          { bg: 'var(--surface-2)',                                             fg: 'var(--text-soft)'     },
};

const STATUS_LABELS = {
  new:             'New',
  diagnosed:       'Diagnosed',
  'in-repair':     'In repair',
  'awaiting-parts':'Awaiting parts',
  ready:           'Ready for pickup',
  closed:          'Closed',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 999,
      background: style.bg,
      color: style.fg,
      fontSize: 12,
      fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
