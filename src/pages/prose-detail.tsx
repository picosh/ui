import {
  fetchMonthlyAnalyticsByBlog,
  schema,
  selectFeatureByName,
  selectMonthlyAnalytics,
  useSelector,
} from "@app/api";
import { proseUrl } from "@app/router";
import {
  AnalyticsSettings,
  Breadcrumbs,
  Button,
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

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: proseUrl(), text: "prose" }]}
        text={post.title}
      />

      {hasAnalytics ? (
        <div className="flex gap">
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
