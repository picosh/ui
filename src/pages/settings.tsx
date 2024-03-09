import { fetchFeatures, fetchPubkeys, fetchTokens } from "@app/api";
import { FeaturesTable, PubkeysTable, TokensTable, UserBox } from "@app/shared";
import { useQuery } from "starfx/react";

export function SettingsPage() {
  useQuery(fetchTokens());
  useQuery(fetchPubkeys());
  useQuery(fetchFeatures());

  return (
    <div className="group">
      <UserBox />
      <PubkeysTable />
      <TokensTable />
      <FeaturesTable />
    </div>
  );
}
