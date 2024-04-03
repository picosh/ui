import { fetchFeatures, fetchPubkeys, fetchTokens } from "@app/api";
import { upsertPubkeyUrl, upsertTokenUrl } from "@app/router";
import {
  AnalyticsSettings,
  ExternalLink,
  FeaturesTable,
  PubkeysTable,
  RssBox,
  TokensTable,
  UserBox,
} from "@app/shared";
import { Link } from "react-router-dom";
import { useQuery } from "starfx/react";

export function SettingsPage() {
  useQuery(fetchTokens());
  useQuery(fetchPubkeys());
  useQuery(fetchFeatures());

  return (
    <div className="group">
      <h2 className="text-xl">Account Info</h2>
      <UserBox />

      <div className="group-h items-center">
        <h2 className="text-xl p-0">Public Keys</h2>
        <Link to={upsertPubkeyUrl()} className="btn-link-sm text-sm">
          create
        </Link>
      </div>
      <PubkeysTable />

      <div className="group-h items-center">
        <h2 className="text-xl p-0">Tokens</h2>
        <ExternalLink
          href="https://pico.sh/api-token"
          className="btn-link-sm text-sm"
        >
          docs
        </ExternalLink>
        <Link to={upsertTokenUrl()} className="btn-link-sm text-sm">
          create
        </Link>
      </div>
      <TokensTable />

      <h2 className="text-xl">Analytics</h2>
      <AnalyticsSettings />

      <h2 className="text-xl">Features Enabled</h2>
      <div>
        Features are how we control what users have access to on the pico
        platform. They always have an expiration date.
      </div>
      <FeaturesTable />

      <h2 className="text-xl">Notifications</h2>
      <RssBox showTitle={false} />
    </div>
  );
}
