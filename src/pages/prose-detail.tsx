import {
  fetchMonthlyAnalyticsByBlog,
  schema,
  selectFeatureByName,
  selectMonthlyAnalytics,
  useSelector,
} from "@app/api";
import { proseUrl } from "@app/router";
import { Breadcrumbs, Button, ExternalLink, IntervalTime } from "@app/shared";
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
          <div className="box group flex-1">
            <h3 className="text-lg">Unique visitors</h3>
            {analytics.intervals.map((interval) => {
              return (
                <IntervalTime key={interval.interval} interval={interval} />
              );
            })}
          </div>

          <div className="box group flex-1">
            <h3 className="text-lg">Top Referers</h3>
            {analytics.top_referers.map((url) => {
              return (
                <div key={url.url}>
                  <ExternalLink href={`//${url.url}`}>{url.url}</ExternalLink>{" "}
                  {url.count}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="box">Want to see analytics? Enable them.</div>
      )}

      <div className="box">
        <Button>Delete Post</Button>
      </div>
    </div>
  );
}
