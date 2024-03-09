import { FeaturesTable } from "@app/shared";

export function HomePage() {
  return (
    <div className="group">
      <h1 className="text-xl">This is the dashboard!</h1>
      <p>This site is still a work in progress.</p>
      <FeaturesTable />
    </div>
  );
}
