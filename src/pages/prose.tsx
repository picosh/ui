import {
  deserializeAnalytics,
  fetchMonthlyAnalyticsByBlog,
  fetchPosts,
  getProseUrl,
  schema,
  selectFeatureByName,
  selectPostsBySpace,
  useSelector,
} from "@app/api";
import { prettyDate } from "@app/date";
import { proseDetailUrl } from "@app/router";
import {
  AnalyticsSettings,
  ExternalLink,
  PageHeader,
  TopReferers,
  TopSiteUrls,
  UniqueVisitorsByTimeBox,
} from "@app/shared";
import { Link } from "react-router-dom";
import { useCache, useQuery } from "starfx/react";

function ProseTable() {
  const user = useSelector(schema.user.select);
  const posts = useSelector((s) => selectPostsBySpace(s, { space: "prose" }));
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Title</th>
          <th className="text-center">Site</th>
          <th className="text-center">Status</th>
          <th className="text-left">Publish At</th>
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
                  <Link to={proseDetailUrl(post.id)}>{post.title}</Link>
                </div>
                <div className="text-sm font-grey-light">{post.filename}</div>
              </td>
              <td className="text-center">
                <ExternalLink href={getProseUrl(user, post)}>View</ExternalLink>
              </td>
              <td className="text-center">
                {post.hidden ? "Unlisted" : "Listed"}
              </td>
              <td className="text-left">{prettyDate(post.publish_at)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ProsePage() {
  const hasAnalytics = useSelector((s) =>
    selectFeatureByName(s, { name: "analytics" }),
  );
  useQuery(fetchPosts({ space: "prose" }));
  const { data } = useCache(fetchMonthlyAnalyticsByBlog());
  const { intervals, urls, refs } = deserializeAnalytics(data);

  return (
    <div className="group">
      <PageHeader title="Prose" docsUrl="/prose" />

      {hasAnalytics ? (
        <>
          <UniqueVisitorsByTimeBox intervals={intervals} />

          <div className="flex gap">
            <TopSiteUrls urls={urls} />
            <TopReferers referers={refs} />
          </div>
        </>
      ) : (
        <AnalyticsSettings />
      )}

      <ProseTable />
    </div>
  );
}
