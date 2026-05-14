import { useState } from 'react';
import Icon from './Icon';

const ACCENT_OPTIONS = [
  { value: '#2C882B', label: 'GRC Green' },
  { value: '#6CB443', label: 'Gator Green' },
  { value: '#006225', label: 'Ever Green' },
  { value: '#418FDE', label: 'Sky Blue' },
];

export default function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="twk-panel" style={{ display: open ? 'flex' : undefined }}>
      <button
        className="twk-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tweaks panel"
        title="Tweaks"
      >
        {open ? <Icon name="x" size={14} /> : <span style={{ fontSize: 14 }}>⚙</span>}
      </button>

      {open && (
        <div className="twk-body">
          <div className="twk-section-label">Appearance</div>

          <div className="twk-row">
            <span className="twk-label">Theme</span>
            <div className="twk-seg">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  className={'twk-seg-btn' + (tweaks.theme === t ? ' active' : '')}
                  onClick={() => setTweak('theme', t)}
                >
                  {t === 'light' ? <Icon name="sun" size={12} /> : <Icon name="moon" size={12} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="twk-row">
            <span className="twk-label">Accent</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {ACCENT_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  title={a.label}
                  onClick={() => setTweak('accent', a.value)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: a.value,
                    border: tweaks.accent === a.value
                      ? '2px solid var(--text)'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="twk-row">
            <span className="twk-label">Density</span>
            <div className="twk-seg">
              {['comfortable', 'compact'].map((d) => (
                <button
                  key={d}
                  className={'twk-seg-btn' + (tweaks.density === d ? ' active' : '')}
                  onClick={() => setTweak('density', d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
