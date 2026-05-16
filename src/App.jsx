import { useState } from "react";

const TONES = [
  { id: "luxe", label: "✦ Luxe", desc: "Élégant & premium" },
  { id: "casual", label: "☀ Casual", desc: "Friendly & accessible" },
  { id: "persuasif", label: "⚡ Persuasif", desc: "Orienté conversion" },
  { id: "minimaliste", label: "◻ Minimaliste", desc: "Épuré & direct" },
];

const PLATFORMS = ["Shopify", "Etsy", "WooCommerce", "Amazon", "Autre"];

export default function ProductGenius() {
  const [form, setForm] = useState({
    nom: "",
    categorie: "",
    caracteristiques: "",
    cible: "",
    ton: "persuasif",
    plateforme: "Shopify",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const generate = async () => {
    if (!form.nom || !form.categorie || !form.caracteristiques) {
      setError("Remplis au moins le nom, la catégorie et les caractéristiques.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const tonLabel = TONES.find((t) => t.id === form.ton)?.label || form.ton;

    const prompt = `Tu es un expert copywriter e-commerce spécialisé dans la rédaction de fiches produits qui convertissent.

Génère 3 variantes de fiche produit pour ${form.plateforme} avec le ton "${tonLabel}".

Produit : ${form.nom}
Catégorie : ${form.categorie}
Caractéristiques clés : ${form.caracteristiques}
Cible : ${form.cible || "Grand public"}

Réponds UNIQUEMENT en JSON valide, sans backticks ni texte autour :
{
  "variantes": [
    {
      "titre": "...",
      "accroche": "...",
      "description": "...",
      "points_forts": ["...", "...", "..."],
      "appel_action": "..."
    },
    { ... },
    { ... }
  ]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed.variantes);
    } catch (e) {
      setError("Erreur lors de la génération. Réessaie !");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const fullText = (v) =>
    `${v.titre}\n\n${v.accroche}\n\n${v.description}\n\n✓ ${v.points_forts.join("\n✓ ")}\n\n${v.appel_action}`;

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          <span style={styles.logoText}>ProductGenius</span>
        </div>
        <div style={styles.badge}>IA · E-commerce</div>
      </div>

      <div style={styles.main}>
        {/* Left panel — form */}
        <div style={styles.panel}>
          <h1 style={styles.headline}>
            Des fiches produits<br />
            <span style={styles.accent}>qui vendent.</span>
          </h1>
          <p style={styles.sub}>
            Remplis les infos, l'IA fait le reste en quelques secondes.
          </p>

          <div style={styles.form}>
            <Label>Nom du produit *</Label>
            <Input
              placeholder="Ex : Sac en cuir végétal Mila"
              value={form.nom}
              onChange={(e) => handleChange("nom", e.target.value)}
            />

            <Label>Catégorie *</Label>
            <Input
              placeholder="Ex : Accessoires de mode"
              value={form.categorie}
              onChange={(e) => handleChange("categorie", e.target.value)}
            />

            <Label>Caractéristiques clés *</Label>
            <textarea
              placeholder="Ex : Cuir recyclé, fermeture magnétique, 3 compartiments, disponible en 5 couleurs"
              value={form.caracteristiques}
              onChange={(e) => handleChange("caracteristiques", e.target.value)}
              style={styles.textarea}
              rows={3}
            />

            <Label>Audience cible</Label>
            <Input
              placeholder="Ex : Femmes 25-45 ans, sensibles à l'écologie"
              value={form.cible}
              onChange={(e) => handleChange("cible", e.target.value)}
            />

            <Label>Plateforme</Label>
            <div style={styles.chips}>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  style={{
                    ...styles.chip,
                    ...(form.plateforme === p ? styles.chipActive : {}),
                  }}
                  onClick={() => handleChange("plateforme", p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <Label>Ton</Label>
            <div style={styles.tones}>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  style={{
                    ...styles.toneBtn,
                    ...(form.ton === t.id ? styles.toneBtnActive : {}),
                  }}
                  onClick={() => handleChange("ton", t.id)}
                >
                  <span style={styles.toneLabel}>{t.label}</span>
                  <span style={styles.toneDesc}>{t.desc}</span>
                </button>
              ))}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={{ ...styles.btn, ...(loading ? styles.btnLoading : {}) }}
              onClick={generate}
              disabled={loading}
              className="generate-btn"
            >
              {loading ? (
                <span style={styles.spinner}>◌ Génération en cours…</span>
              ) : (
                "✦ Générer mes fiches produits"
              )}
            </button>
          </div>
        </div>

        {/* Right panel — results */}
        <div style={styles.results}>
          {!result && !loading && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>✦</div>
              <p style={styles.emptyText}>
                Tes 3 variantes de fiche produit<br />apparaîtront ici.
              </p>
            </div>
          )}

          {loading && (
            <div style={styles.empty}>
              <div style={{ ...styles.emptyIcon, animation: "pulse 1.2s infinite" }}>◌</div>
              <p style={styles.emptyText}>L'IA rédige tes fiches…</p>
            </div>
          )}

          {result &&
            result.map((v, i) => (
              <div key={i} style={styles.card} className="card">
                <div style={styles.cardHeader}>
                  <span style={styles.varLabel}>Variante {i + 1}</span>
                  <button
                    style={{
                      ...styles.copyBtn,
                      ...(copied === i ? styles.copyBtnDone : {}),
                    }}
                    onClick={() => copy(fullText(v), i)}
                  >
                    {copied === i ? "✓ Copié !" : "Copier"}
                  </button>
                </div>

                <h3 style={styles.cardTitle}>{v.titre}</h3>
                <p style={styles.accroche}>{v.accroche}</p>
                <p style={styles.desc}>{v.description}</p>

                <ul style={styles.points}>
                  {v.points_forts.map((pt, j) => (
                    <li key={j} style={styles.point}>
                      <span style={styles.check}>✓</span> {pt}
                    </li>
                  ))}
                </ul>

                <div style={styles.cta}>{v.appel_action}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label style={styles.label}>{children}</label>;
}

function Input({ placeholder, value, onChange }) {
  return (
    <input
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f0ede8",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid #1e1e1e",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "22px",
    color: "#c9a84c",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "#f0ede8",
  },
  badge: {
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.15em",
    color: "#666",
    textTransform: "uppercase",
    border: "1px solid #222",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  main: {
    display: "flex",
    flex: 1,
    gap: "0",
  },
  panel: {
    width: "420px",
    minWidth: "380px",
    padding: "40px",
    borderRight: "1px solid #1a1a1a",
    display: "flex",
    flexDirection: "column",
  },
  headline: {
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 12px",
    color: "#f0ede8",
  },
  accent: {
    color: "#c9a84c",
    fontStyle: "italic",
  },
  sub: {
    fontSize: "14px",
    color: "#888",
    margin: "0 0 32px",
    lineHeight: "1.6",
    fontFamily: "'Courier New', monospace",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#888",
    fontFamily: "'Courier New', monospace",
    marginBottom: "-8px",
  },
  input: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#f0ede8",
    fontSize: "14px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#f0ede8",
    fontSize: "14px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #222",
    background: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    transition: "all 0.2s",
  },
  chipActive: {
    background: "#c9a84c22",
    border: "1px solid #c9a84c",
    color: "#c9a84c",
  },
  tones: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  toneBtn: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #222",
    background: "#111",
    color: "#888",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  toneBtnActive: {
    border: "1px solid #c9a84c",
    background: "#c9a84c11",
    color: "#f0ede8",
  },
  toneLabel: {
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Georgia', serif",
  },
  toneDesc: {
    fontSize: "10px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    opacity: 0.7,
  },
  error: {
    color: "#e05555",
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
    margin: 0,
  },
  btn: {
    marginTop: "8px",
    padding: "16px",
    background: "#c9a84c",
    color: "#0a0a0a",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    letterSpacing: "0.03em",
    transition: "all 0.2s",
  },
  btnLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
  },
  results: {
    flex: 1,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflowY: "auto",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    opacity: 0.4,
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#c9a84c",
  },
  emptyText: {
    textAlign: "center",
    fontSize: "15px",
    lineHeight: "1.7",
    fontFamily: "'Courier New', monospace",
    color: "#888",
  },
  card: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "border-color 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  varLabel: {
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#c9a84c",
    fontFamily: "'Courier New', monospace",
  },
  copyBtn: {
    padding: "5px 14px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: "20px",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    transition: "all 0.2s",
  },
  copyBtnDone: {
    border: "1px solid #4caf78",
    color: "#4caf78",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f0ede8",
    margin: 0,
    lineHeight: "1.3",
  },
  accroche: {
    fontSize: "15px",
    color: "#c9a84c",
    fontStyle: "italic",
    margin: 0,
    lineHeight: "1.5",
  },
  desc: {
    fontSize: "14px",
    color: "#aaa",
    margin: 0,
    lineHeight: "1.7",
  },
  points: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  point: {
    fontSize: "13px",
    color: "#ccc",
    display: "flex",
    gap: "8px",
    lineHeight: "1.5",
    fontFamily: "'Courier New', monospace",
  },
  check: {
    color: "#4caf78",
    fontWeight: "bold",
  },
  cta: {
    marginTop: "4px",
    padding: "12px 16px",
    background: "#c9a84c18",
    border: "1px solid #c9a84c44",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#c9a84c",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.03em",
  },
};

const css = `
  * { box-sizing: border-box; }
  input:focus, textarea:focus { border-color: #c9a84c !important; }
  .generate-btn:hover:not(:disabled) { background: #d4b56a !important; transform: translateY(-1px); }
  .card:hover { border-color: #2a2a2a !important; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;
