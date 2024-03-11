import { fetchPosts } from "@app/api";
import { PostsTable } from "@app/shared";
import { useQuery } from "starfx/react";

export function ProsePage() {
  useQuery(fetchPosts({ space: "prose" }));

  return (
    <div className="group">
      <h2 className="text-xl">Posts</h2>
      <PostsTable space="prose" />
    </div>
  );
}
