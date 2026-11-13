import { Link } from "react-router-dom";
import { Page } from "../components/PageTransition";
import { profile } from "../content";

/** Temporary page for routes built in the next step (work grid, info). */
export function Placeholder({ name }: { name: string }) {
  return (
    <Page title={`${name} — ${profile.name}`}>
      <div className="grid" style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}>
        <div style={{ gridColumn: "1 / span 12" }}>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1 }}><em>{name}</em> is being sewn.</h1>
          <p style={{ marginTop: 16 }}>
            <Link to="/" className="bracket link-line">back to the index</Link>
          </p>
        </div>
      </div>
    </Page>
  );
}
