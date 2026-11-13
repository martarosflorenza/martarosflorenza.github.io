import { Link, NavLink, useLocation } from "react-router-dom";
import { profile } from "../content";
import { ThreadLoop } from "./doodles/Doodles";

const NAV = [
  { to: "/", label: "index" },
  { to: "/work", label: "work" },
  { to: "/info", label: "info" },
];

export function Header() {
  const { pathname } = useLocation();
  const [first, ...rest] = profile.name.split(" ");
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
        {first} <em>{rest.join(" ")}</em>
      </Link>
      <nav aria-label="Main">
        <ul className="site-nav">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} aria-current={active ? "page" : undefined}>
                  <span className="bracket">{item.label}</span>
                  {active && <ThreadLoop className="nav-loop" key={pathname} delay={0.5} inView={false} />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
