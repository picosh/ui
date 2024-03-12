import { fetchFeatures, fetchPubkeys, fetchTokens } from "@app/api";
import {
  FeaturesTable,
  PubkeysTable,
  RssBox,
  TokensTable,
  UserBox,
} from "@app/shared";
import { useQuery } from "starfx/react";

export function SettingsPage() {
  useQuery(fetchTokens());
  useQuery(fetchPubkeys());
  useQuery(fetchFeatures());

  return (
    <div className="group">
      <h2 className="text-xl">Account Info</h2>
      <UserBox />

      <h2 className="text-xl">Public Keys</h2>
      <PubkeysTable />

      <h2 className="text-xl">API Tokens</h2>
      <TokensTable />

      <h2 className="text-xl">Features Enabled</h2>
      <FeaturesTable />

      <h2 className="text-xl">Notifications</h2>
      <RssBox showTitle={false} />
    </div>
  );
}
