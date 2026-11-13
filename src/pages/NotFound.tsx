import { Link } from "react-router-dom";
import { Page } from "../components/PageTransition";
import { SafetyPin } from "../components/doodles/Doodles";

export function NotFound() {
  return (
    <Page title="Not found — Marta Ros Florenza">
      <div className="grid" style={{ paddingTop: "calc(var(--header-h) + 18vh)", rowGap: 24 }}>
        <div style={{ gridColumn: "1 / span 12" }}>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1 }}>
            This page came <em>unstitched.</em>
          </h1>
          <p style={{ marginTop: 16 }}>
            <Link to="/" className="bracket link-line">back to the index</Link>
          </p>
        </div>
        <SafetyPin style={{ gridColumn: "10 / span 2", width: 80 }} />
      </div>
    </Page>
  );
}
