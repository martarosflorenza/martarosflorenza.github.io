import { Link, useLocation } from "react-router-dom";
import { profile } from "../content";
import { getWorkPath } from "../lib/scrollMemory";

const NAV = [
  { to: "/", label: "home" },
  { to: "/work", label: "work" },
  { to: "/info", label: "info" },
];

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
        {profile.name}
      </Link>
      <nav aria-label="Main">
        <ul className="site-nav">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            // "work" reopens the category the visitor last viewed (read on every render, i.e. every page change).
            const to = item.to === "/work" ? getWorkPath() : item.to;
            return (
              <li key={item.to}>
                <Link to={to} aria-current={active ? "page" : undefined}>
                  <span className="bracket">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
