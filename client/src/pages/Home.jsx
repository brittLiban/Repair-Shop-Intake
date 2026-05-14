import { useNavigate } from 'react-router-dom';
import Icon from '../components/shared/Icon';

const SERVICES = [
  { num: '01', title: 'Diagnostics', desc: 'Complete diagnosis of your PC or laptop issue. We explain what we find before any work begins.' },
  { num: '02', title: 'OS Reinstall & Setup', desc: 'Clean install of legitimate Windows. Driver setup. Configuration.' },
  { num: '03', title: 'Malware & Virus Removal', desc: 'Scan, removal, and security hardening.' },
  { num: '04', title: 'Hardware Diagnosis', desc: 'Screen, keyboard, fan, RAM, hard drive, SSD, system board, optical drive, AC adapter.' },
  { num: '05', title: 'Data Recovery', desc: 'Recovery attempts from failing drives. Bring your own external drive or flash media for backups.' },
  { num: '06', title: 'Part Installation', desc: 'You provide the part, we install it at no cost. We can advise what to buy.' },
];

const HOW_IT_WORKS = [
  { n: '1', t: 'Fill out intake forms', d: 'No account needed — complete the Issue Description, Policies, and Work Order/Release right here. You\'ll get a ticket number to bring with your device.' },
  { n: '2', t: 'Diagnose + Repair', d: 'A student technician opens a work order under faculty supervision and contacts you with findings. Repairs are first-come, first-served.' },
  { n: '3', t: 'Pickup', d: 'You\'ll be notified when your device is ready. Sign the Pick-Up Receipt and Equipment Ledger to confirm everything was returned and the work is to your satisfaction.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            Green River College · IT Program
          </div>
          <h1>Free PC repair, by students learning the trade.</h1>
          <p className="lede">
            The Green River PC Repair Shop is a student-staffed lab under faculty supervision.
            All services are <strong style={{ color: 'var(--text)' }}>free of charge</strong> — donations are welcome and help fund shop supplies.
          </p>
          <div className="cta-row">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/intake')}>
              Start a repair <Icon name="arrow-right" />
            </button>
          </div>
          <div style={{ marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'color-mix(in oklab, var(--green-leaf) 16%, transparent)', border: '1px solid color-mix(in oklab, var(--green-grc) 24%, transparent)', borderRadius: 8, fontSize: 13, color: 'var(--text)' }}>
            <Icon name="shield" size={14} /> Walk-ins welcome at <strong>TC&#8209;104</strong>. First-come, first-served.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What we work on</h2>
          <p className="section-lede">Common repairs. Anything not listed — bring it by for a free look. We work on Windows machines; macOS and ChromeOS on a case-by-case basis.</p>
          <div className="grid grid-3">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.num}>
                <span className="num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid-2">
            <div className="info-block">
              <h3><Icon name="clock" size={12} />&nbsp; Hours</h3>
              {[['Monday','10:00 – 16:00'],['Tuesday','10:00 – 16:00'],['Wednesday','10:00 – 16:00'],['Thursday','10:00 – 16:00'],['Friday','10:00 – 14:00'],['Saturday – Sunday','Closed']].map(([day, hrs]) => (
                <div className="row" key={day}>
                  <span className="day">{day}</span>
                  <span className="mono" style={hrs === 'Closed' ? { color: 'var(--text-soft)' } : {}}>{hrs}</span>
                </div>
              ))}
            </div>
            <div className="info-block">
              <h3><Icon name="pin" size={12} />&nbsp; Location &amp; Contact</h3>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                <div><strong>Tech Center, Room TC-104</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>Green River College</div>
                <div style={{ color: 'var(--text-muted)' }}>12401 SE 320th St, Auburn, WA 98092</div>
                <div style={{ height: 14 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="phone" size={14} /><span className="mono">(253) 555-0142</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Icon name="mail" size={14} />repair@greenriver.edu</div>
                <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-2)', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)' }}>
                  Items not picked up within <strong>180 days</strong> of completion will be considered abandoned and recycled.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>How it works</h2>
          <p className="section-lede">Three steps, from intake to pickup.</p>
          <div className="grid grid-3">
            {HOW_IT_WORKS.map((s) => (
              <div className="info-block" key={s.n}>
                <div className="mono" style={{ fontSize: 24, color: 'var(--accent)', marginBottom: 8 }}>{s.n}.</div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
