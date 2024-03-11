import { NavLink as NLink, Outlet } from "react-router-dom";
import { schema, selectHasRegistered, useSelector } from "./api.ts";
import {
  homeUrl,
  imgsUrl,
  pastesUrl,
  pgsUrl,
  proseUrl,
  settingsUrl,
} from "./router";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const hasRegistered = useSelector(selectHasRegistered);
  if (hasRegistered) {
    return (
      <NLink
        to={to}
        className={({ isActive }) => (isActive ? "link-alt-hover" : "link-alt")}
        end
      >
        {children}
      </NLink>
    );
  }

  return <span className="font-grey-light">{children}</span>;
}

export function Nav() {
  const user = useSelector(schema.user.select);
  return (
    <nav className="text-md">
      <NavLink to={homeUrl()}>(+)</NavLink>
      <NavLink to={pgsUrl()}>pages</NavLink>
      <NavLink to={imgsUrl()}>imgs</NavLink>
      <NavLink to={proseUrl()}>prose</NavLink>
      <NavLink to={pastesUrl()}>pastes</NavLink>
      <NavLink to={settingsUrl()}>{user.name}</NavLink>
    </nav>
  );
}

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="container">
      <Nav />
      <main>{children ? children : <Outlet />}</main>
    </div>
  );
}
