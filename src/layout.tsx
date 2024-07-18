import { NavLink as NLink, type NavLinkProps, Outlet } from "react-router-dom";
import { schema, selectHasRegistered, useSelector } from "./api.ts";
import {
  feedsUrl,
  homeUrl,
  pastesUrl,
  pgsUrl,
  proseUrl,
  settingsUrl,
} from "./router";
import { Logo } from "./shared.tsx";

function NavLink({
  to,
  children,
  ...props
}: { to: string; children: React.ReactNode } & NavLinkProps &
  React.RefAttributes<HTMLAnchorElement>) {
  const hasRegistered = useSelector(selectHasRegistered);
  if (hasRegistered) {
    return (
      <NLink
        to={to}
        className={({ isActive }) => (isActive ? "link-alt-hover" : "link-alt")}
        end
        {...props}
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
      <NavLink to={homeUrl()} style={{ height: 22 }}>
        <Logo />
      </NavLink>
      <NavLink to={pgsUrl()}>pages</NavLink>
      <NavLink to={proseUrl()}>prose</NavLink>
      <NavLink to={pastesUrl()}>pastes</NavLink>
      <NavLink to={feedsUrl()}>rss-to-email</NavLink>
      <NavLink to={settingsUrl()}>{user.name}</NavLink>
    </nav>
  );
}

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="container">
      <Nav />
      <main className="mb-4">{children ? children : <Outlet />}</main>
    </div>
  );
}
