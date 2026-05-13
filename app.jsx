// GRC Repair Shop — main app shell, routing, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#2C882B",
  "density": "comfortable"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#2C882B", "#6CB443", "#006225", "#418FDE"];

const App = () => {
  const [route, setRoute] = useState(() => location.hash.replace("#/", "") || "home");
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);
  const [submission, setSubmission] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("grc-user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", tweaks.theme);
    root.setAttribute("data-density", tweaks.density);
    root.style.setProperty("--accent", tweaks.accent);
    const hoverMap = {
      "#2C882B": "#006225",
      "#6CB443": "#2C882B",
      "#006225": "#004a1c",
      "#418FDE": "#2A6FB7",
    };
    root.style.setProperty("--accent-hover", hoverMap[tweaks.accent] || tweaks.accent);
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  const navigate = useCallback((r) => {
    setSubmission(null);
    setRoute(r);
    location.hash = "#/" + r;
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace("#/", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleSubmit = (formTitle, ticket, data) => {
    setSubmission({ formTitle, ticket });
    window.scrollTo(0, 0);
  };

  const handleLogin = (u) => {
    localStorage.setItem("grc-user", JSON.stringify(u));
    setUser(u);
    navigate("portal");
  };
  const handleSignOut = () => {
    localStorage.removeItem("grc-user");
    setUser(null);
    navigate("home");
  };

  let view;
  if (submission) {
    view = <SubmissionSuccess formTitle={submission.formTitle} ticket={submission.ticket}
      onAnother={() => { setSubmission(null); navigate("forms"); }}
      onHome={() => { setSubmission(null); navigate(user ? "portal" : "home"); }} />;
  } else {
    switch (route) {
      case "home":            view = <Home navigate={navigate} />; break;
      case "forms":           view = <FormChooser navigate={navigate} />; break;
      case "form-intake":     view = <FormIssue navigate={navigate} onSubmit={handleSubmit} />; break;
      case "form-policies":   view = <FormPolicies navigate={navigate} onSubmit={handleSubmit} />; break;
      case "form-work-order": view = <FormWorkOrder navigate={navigate} onSubmit={handleSubmit} />; break;
      case "form-equipment":  view = <FormEquipment navigate={navigate} onSubmit={handleSubmit} />; break;
      case "form-pickup":     view = <FormPickup navigate={navigate} onSubmit={handleSubmit} />; break;
      case "dashboard":       view = <Dashboard navigate={navigate} />; break;
      case "portal":          view = user
                                ? <Portal user={user} onSignOut={handleSignOut} navigate={navigate} />
                                : <PortalLogin navigate={navigate} onLogin={handleLogin} />; break;
      default:                view = <Home navigate={navigate} />; break;
    }
  }

  const topRoute = route.startsWith("form") ? "forms" : route;

  return (
    <div className="app">
      <Header route={topRoute} navigate={navigate} user={user} onSignOut={handleSignOut} />
      <main style={{ flex: 1 }}>{view}</main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Appearance">
          <TweakRadio
            label="Theme"
            value={tweaks.theme}
            options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
            onChange={v => setTweaks("theme", v)}
          />
          <TweakColor
            label="Accent color"
            value={tweaks.accent}
            options={ACCENT_OPTIONS}
            onChange={v => setTweaks("accent", v)}
          />
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]}
            onChange={v => setTweaks("density", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
