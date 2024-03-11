import { fetchPosts } from "@app/api";
import { PostsTable } from "@app/shared";
import { useQuery } from "starfx/react";

export function FeedsPage() {
  useQuery(fetchPosts({ space: "feeds" }));

  return (
    <div className="group">
      <h2 className="text-xl">Feeds</h2>
      <PostsTable space="feeds" />
    </div>
  );
}
