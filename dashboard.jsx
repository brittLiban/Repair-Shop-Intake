// GRC Repair Shop — Technician Dashboard

const SAMPLE_TICKETS = [
  { id: "GRC-26-05-11-7821", client: "Maya Chen",       device: "MacBook Air M2",       issue: "Won't turn on after spill",   status: "In repair",      tech: "J. Park",   age: "2h",    priority: "high" },
  { id: "GRC-26-05-11-7820", client: "Devon Walker",    device: "Dell XPS 15",          issue: "Battery doesn't hold charge", status: "Awaiting parts", tech: "L. Singh",  age: "1d",    priority: "med"  },
  { id: "GRC-26-05-10-7798", client: "Aisha Mohamed",   device: "HP Pavilion Desktop",  issue: "Slow boot, fan rattle",       status: "Diagnosed",      tech: "—",         age: "1d",    priority: "low"  },
  { id: "GRC-26-05-10-7795", client: "Caleb Reyes",     device: "Lenovo ThinkPad T14",  issue: "Keyboard keys unresponsive",  status: "New",            tech: "—",         age: "3h",    priority: "med"  },
  { id: "GRC-26-05-09-7780", client: "Priya Natarajan", device: "Surface Pro 9",        issue: "Touchscreen flickers",         status: "In repair",      tech: "K. Ortiz",  age: "2d",    priority: "med"  },
  { id: "GRC-26-05-09-7776", client: "Tom Eklund",      device: "Custom desktop tower", issue: "No video output",              status: "Ready for pickup",tech: "J. Park",   age: "3d",    priority: "low"  },
  { id: "GRC-26-05-08-7765", client: "Selena Park",     device: "MacBook Pro 14",       issue: "Slow performance, malware?",   status: "Ready for pickup",tech: "L. Singh",  age: "4d",    priority: "low"  },
  { id: "GRC-26-05-08-7760", client: "Marcus Lee",      device: "Acer Aspire 5",        issue: "BSOD on startup",              status: "New",            tech: "—",         age: "5h",    priority: "high" },
];

const statusBadge = (s) => {
  switch (s) {
    case "New":               return <span className="badge orange"><span className="dot"></span>{s}</span>;
    case "Diagnosed":         return <span className="badge blue"><span className="dot"></span>{s}</span>;
    case "Awaiting parts":    return <span className="badge gray"><span className="dot"></span>{s}</span>;
    case "In repair":         return <span className="badge blue"><span className="dot"></span>{s}</span>;
    case "Ready for pickup":  return <span className="badge green"><span className="dot"></span>{s}</span>;
    default: return <span className="badge gray">{s}</span>;
  }
};

const priorityBadge = (p) => {
  if (p === "high") return <span className="badge orange">High</span>;
  if (p === "med")  return <span className="badge gray">Med</span>;
  return <span className="badge gray" style={{opacity:0.7}}>Low</span>;
};

const Dashboard = ({ navigate }) => {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const tabs = useMemo(() => {
    const groups = {
      all: SAMPLE_TICKETS,
      new: SAMPLE_TICKETS.filter(t => t.status === "New"),
      active: SAMPLE_TICKETS.filter(t => ["Diagnosed","In repair","Awaiting parts"].includes(t.status)),
      ready: SAMPLE_TICKETS.filter(t => t.status === "Ready for pickup"),
    };
    return groups;
  }, []);

  const list = (tabs[tab] || []).filter(t =>
    !query || t.client.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()) || t.device.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dash">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>Technician Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Today is <span className="mono">Mon, May 11, 2026</span>. Shop opens in 25 min.</p>
          </div>
          <div className="toolbar">
            <button className="btn btn-secondary btn-sm"><Icon name="filter" size={14} /> Filter</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("form-intake")}><Icon name="plus" size={14} /> New ticket</button>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="kpi-label">Open tickets</div>
            <div className="kpi-value">14</div>
            <div className="kpi-trend">3 new today</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">In repair</div>
            <div className="kpi-value">5</div>
            <div className="kpi-trend">2 awaiting parts</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Ready for pickup</div>
            <div className="kpi-value" style={{ color: 'var(--green-grc)' }}>2</div>
            <div className="kpi-trend">Oldest: 4d</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Avg turnaround</div>
            <div className="kpi-value">2.4<span style={{fontSize:18, color:'var(--text-muted)', fontWeight: 400}}>&nbsp;d</span></div>
            <div className="kpi-trend up">↓ 12% vs last wk</div>
          </div>
        </div>

        <div className="tabs">
          <button className="tab" aria-selected={tab==='all'}    onClick={()=>setTab('all')}>All <span className="count">{tabs.all.length}</span></button>
          <button className="tab" aria-selected={tab==='new'}    onClick={()=>setTab('new')}>New <span className="count">{tabs.new.length}</span></button>
          <button className="tab" aria-selected={tab==='active'} onClick={()=>setTab('active')}>Active <span className="count">{tabs.active.length}</span></button>
          <button className="tab" aria-selected={tab==='ready'}  onClick={()=>setTab('ready')}>Ready <span className="count">{tabs.ready.length}</span></button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 14 }}>
          <div style={{ position:'relative', flex:1, maxWidth: 360 }}>
            <span style={{ position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)', color:'var(--text-soft)' }}><Icon name="search" size={14} /></span>
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search by ticket, client, or device" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{list.length} ticket{list.length===1?'':'s'}</span>
        </div>

        <table className="queue-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Client / Device</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Tech</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t.id}>
                <td className="mono"><span style={{ color: 'var(--accent)' }}>{t.id}</span></td>
                <td>
                  {t.client}
                  <span className="sub">{t.device}</span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{t.issue}</td>
                <td>{statusBadge(t.status)}</td>
                <td>{priorityBadge(t.priority)}</td>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.tech}</td>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.age}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No tickets match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
