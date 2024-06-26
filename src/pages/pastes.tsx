import {
  fetchPosts,
  getPastesUrl,
  schema,
  selectPostsBySpace,
  useSelector,
} from "@app/api";
import { prettyDate } from "@app/date";
import { PageHeader } from "@app/shared";
import { useQuery } from "starfx/react";

function PastesTable() {
  const user = useSelector(schema.user.select);
  const posts = useSelector((s) => selectPostsBySpace(s, { space: "pastes" }));
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Filename</th>
          <th className="text-center">Status</th>
          <th className="text-left">Expires At</th>
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
                <a href={getPastesUrl(user, post)}>{post.filename}</a>
              </td>
              <td className="text-center">
                {post.hidden ? "Unlisted" : "Listed"}
              </td>
              <td className="text-left">{prettyDate(post.expires_at)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function PastesPage() {
  useQuery(fetchPosts({ space: "pastes" }));

  return (
    <div className="group">
      <PageHeader title="Pastes" docsUrl="/pastes" />
      <PastesTable />
    </div>
  );
}
