import { fetchPosts } from "@app/api";
import { PostsTable } from "@app/shared";
import { useQuery } from "starfx/react";

export function PastesPage() {
  useQuery(fetchPosts({ space: "pastes" }));

  return (
    <div className="group">
      <h2 className="text-xl">Pastes</h2>
      <PostsTable space="pastes" />
    </div>
  );
}
