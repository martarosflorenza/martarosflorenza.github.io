import { profile } from "../content";
import { Hanger } from "./doodles/Doodles";

export function Footer() {
  const { email, instagram, phone } = profile.contact;
  return (
    <footer className="site-footer">
      <hr className="stitch" style={{ marginInline: "var(--margin)", marginBottom: 28 }} />
      <div className="grid">
        <div style={{ gridColumn: "1 / span 12", maxWidth: 420 }} className="footer-lead">
          <p className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>
            Available for editorial, runway &amp; commercial work.
          </p>
        </div>
        <ul style={{ gridColumn: "1 / span 8", display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
          <li><a className="link-line" href={`mailto:${email}`}>{email}</a></li>
          <li><a className="link-line" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}</a></li>
          <li><a className="link-line" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
        </ul>
        <div style={{ gridColumn: "9 / span 4", display: "flex", justifyContent: "flex-end", alignItems: "end", gap: 12 }}>
          <span className="small soft">© {new Date().getFullYear()} {profile.name.toLowerCase()}</span>
          <Hanger className="footer-hanger" style={{ width: 44, color: "var(--ink)" }} />
        </div>
      </div>
    </footer>
  );
}
