import { selectStats } from "@app/api";
import {
  Count,
  ExternalLink,
  PlusBox,
  SummaryAnalyticsView,
} from "@app/shared";
import { useSelector } from "starfx/react";

export function HomePage() {
  const stats = useSelector(selectStats);
  return (
    <div className="group">
      <h1 className="text-xl">Dashboard</h1>

      <div className="flex gap collapse">
        <div className="box group flex-1">
          <h3 className="text-lg p-0">Help</h3>
          <div>
            <ExternalLink
              href="https://pico.sh/getting-started#next-steps"
              className="btn-link"
            >
              Getting Started
            </ExternalLink>
          </div>
        </div>

        <div className="box group flex-1">
          <h3 className="text-lg p-0">Stats</h3>
          <ul className="m-0">
            <li>
              Projects: <Count value={stats.projects} />
            </li>
            <li>
              Prose: <Count value={stats.prose} />
            </li>
            <li>
              Pastes: <Count value={stats.pastes} />
            </li>
            <li>
              Feeds: <Count value={stats.feeds} />
            </li>
          </ul>
        </div>
      </div>

      <SummaryAnalyticsView />

      <PlusBox />
    </div>
  );
}
