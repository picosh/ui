import { fetchPosts, selectPostsBySpace, useSelector } from "@app/api";
import { useQuery } from "starfx/react";

function FeedsTable() {
  const posts = useSelector((s) => selectPostsBySpace(s, { space: "feeds" }));
  return (
    <div className="group">
      {posts.length === 0 ? <div>No feeds found!</div> : null}
      {posts.map((post) => {
        return (
          <div key={post.id} className="box group">
            <h3 className="text-lg">{post.filename}</h3>
            <pre>{post.text}</pre>
          </div>
        );
      })}
    </div>
  );
}

export function FeedsPage() {
  useQuery(fetchPosts({ space: "feeds" }));

  return (
    <div className="group">
      <h2 className="text-xl">Feeds</h2>
      <FeedsTable />
    </div>
  );
}
