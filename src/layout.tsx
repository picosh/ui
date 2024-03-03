export function Nav() {
  return (
    <nav>
      <h1 className="text-2xl text-underline-hdr text-hdr inline-block">
        pico
      </h1>
      <ol>
        <li>signup</li>
      </ol>
    </nav>
  );
}

export function Layout({
  children,
}: { children: React.ReactNode; }) {
  return (
    <main className="container-sm">{children}</main>
  );
}
