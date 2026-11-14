import { profile } from "../content";

export function Footer() {
  const { email, instagram, phone } = profile.contact;
  return (
    <footer className="site-footer">
      <hr className="rule" style={{ marginInline: "var(--margin)", marginBottom: 28 }} />
      <div className="grid">
        <ul className="footer-links">
          <li><a className="link-line" href={`mailto:${email}`}>{email}</a></li>
          <li><a className="link-line" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}</a></li>
          <li><a className="link-line" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
        </ul>
        <div className="footer-copy">
          <span className="small soft">© {new Date().getFullYear()} {profile.name.toLowerCase()}</span>
        </div>
      </div>
    </footer>
  );
}
