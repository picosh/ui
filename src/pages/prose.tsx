import {
  fetchPosts,
  getProseUrl,
  schema,
  selectPostsBySpace,
  useSelector,
} from "@app/api";
import { useQuery } from "starfx/react";

function ProseTable() {
  const user = useSelector(schema.user.select);
  const posts = useSelector((s) => selectPostsBySpace(s, { space: "prose" }));
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Title</th>
          <th className="text-center">Status</th>
          <th className="text-left">Published At</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              No posts!
            </td>
          </tr>
        ) : null}
        {posts.map((post) => {
          return (
            <tr key={post.id}>
              <td className="text-left">
                <div>
                  <a href={getProseUrl(user, post)}>{post.title}</a>
                </div>
                <div className="text-sm font-grey-light">{post.filename}</div>
              </td>
              <td className="text-center">
                {post.hidden ? "Unlisted" : "Listed"}
              </td>
              <td className="text-left">
                {new Date(post.publish_at).toDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ProsePage() {
  useQuery(fetchPosts({ space: "prose" }));

  return (
    <div className="group">
      <h2 className="text-xl">Posts</h2>
      <ProseTable />
    </div>
  );
}
