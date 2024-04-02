import {
  fetchMonthlyAnalyticsByBlog,
  getProseUrl,
  schema,
  selectFeatureByName,
  selectMonthlyAnalytics,
  useSelector,
} from "@app/api";
import { prettyDate } from "@app/date";
import { proseUrl } from "@app/router";
import {
  AnalyticsSettings,
  Breadcrumbs,
  Button,
  ExternalLink,
  TopReferers,
  UniqueVisitorsByTimeBox,
} from "@app/shared";
import { useParams } from "react-router";
import { useQuery } from "starfx/react";

export function ProseDetailPage() {
  const { id = "" } = useParams();
  const hasAnalytics = useSelector((s) =>
    selectFeatureByName(s, { name: "analytics" }),
  );
  const post = useSelector((s) => schema.posts.selectById(s, { id }));
  useQuery(fetchMonthlyAnalyticsByBlog());
  const analytics = useSelector(selectMonthlyAnalytics);
  const user = useSelector(schema.user.select);

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: proseUrl(), text: "prose" }]}
        text={post.title}
      />

      <div className="box group">
        <dl style={{ columnCount: 2 }}>
          <dt>ID</dt>
          <dd>
            <code>{post.id}</code>
          </dd>

          <dt>Site</dt>
          <dd>
            <ExternalLink href={getProseUrl(user, post)}>View</ExternalLink>
          </dd>

          <dt>Description</dt>
          <dd>{post.description}</dd>

          <dt>Publish At</dt>
          <dd>{prettyDate(post.publish_at)}</dd>

          <dt>Created At</dt>
          <dd>{prettyDate(post.created_at)}</dd>

          <dt>Updated At</dt>
          <dd>{prettyDate(post.updated_at)}</dd>

          <dt>Listed</dt>
          <dd>{post.hidden ? "No" : "Yes"}</dd>
        </dl>
      </div>

      {hasAnalytics ? (
        <div className="group">
          <UniqueVisitorsByTimeBox intervals={analytics.intervals} />
          <TopReferers referers={analytics.top_referers} />
        </div>
      ) : (
        <AnalyticsSettings />
      )}

      <div className="box">
        <Button>Delete Post</Button>
      </div>
    </div>
  );
}
