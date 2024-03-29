import {
  ProjectObject,
  VisitInterval,
  fetchMonthlyAnalyticsByProject,
  fetchProjectObjects,
  getProjectUrl,
  objectSort,
  schema,
  selectFeatureByName,
  selectMonthlyAnalyticsByProject,
  selectObjectsByProjectName,
  selectProjectByName,
  useSelector,
} from "@app/api";
import { usePaginate } from "@app/paginate";
import { pgsDetailUrl, pgsUrl } from "@app/router";
import { Breadcrumbs, Button, ExternalLink } from "@app/shared";
import { useState } from "react";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "starfx/react";

const truncateDate = (dateStr: string): string => {
  const ds = dateStr.split("T");
  return ds[0];
};

function IntervalTime({ interval }: { interval: VisitInterval }) {
  return (
    <div>
      {truncateDate(interval.interval)} {interval.visitors}
    </div>
  );
}

export function PgsDetailPage() {
  const { name = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const [sortDir, setSortDir] = useState("asc");
  const [sortBy, setSortBy] = useState("name" as keyof ProjectObject);
  const hasAnalytics = useSelector((s) =>
    selectFeatureByName(s, { name: "analytics" }),
  );
  const user = useSelector(schema.user.select);
  const url = getProjectUrl(user, { name });
  const project = useSelector((s) => selectProjectByName(s, { name }));
  useQuery(fetchProjectObjects({ name: project.project_dir }));
  useQuery(fetchMonthlyAnalyticsByProject({ projectId: project.id }));
  const objects = useSelector((s) =>
    selectObjectsByProjectName(s, { name: project.project_dir }),
  )
    .filter((obj) => {
      if (search === "") {
        return true;
      }
      const match = `/${obj.name}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase());
      return match;
    })
    .sort((a, b) => {
      if (sortBy === "size") {
        if (sortDir === "asc") {
          return a.size - b.size;
        }
        return b.size - a.size;
      }

      if (sortDir === "desc") {
        return objectSort(b, a);
      }

      return objectSort(a, b);
    });
  const paginate = usePaginate(objects);
  const sorter = (by: keyof ProjectObject) => {
    paginate.setPage(1);
    setSortDir(sortDir === "asc" ? "desc" : "asc");
    setSortBy(by);
  };
  const analytics = useSelector(selectMonthlyAnalyticsByProject);
  const projectName = `${project.name} (alias: ${project.project_dir})`;

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: pgsUrl(), text: "pgs" }]}
        text={projectName}
      />

      {hasAnalytics ? (
        <>
          <div className="box group flex-1">
            <h3 className="text-lg">Unique visitors</h3>
            {analytics.intervals.map((interval) => {
              return (
                <IntervalTime key={interval.interval} interval={interval} />
              );
            })}
          </div>

          <div className="flex gap">
            <div className="box group flex-1">
              <h3 className="text-lg">Top URLs</h3>
              {analytics.top_urls.map((url) => {
                return (
                  <div key={url.url}>
                    <Link to={pgsDetailUrl(project.name, url.url)} replace>
                      {url.url}
                    </Link>{" "}
                    {url.count}
                  </div>
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
        </>
      ) : (
        <div className="box">Want to see analytics? Enable them.</div>
      )}

      <input
        placeholder="Search for objects"
        value={search}
        onChange={(ev) =>
          setParams({ search: ev.currentTarget.value }, { replace: true })
        }
      />

      <div className="group-h">
        <div>{paginate.totalItems} objects</div>
        <span>&middot;</span>
        <Button onClick={paginate.prev} className="border px" variant="sm">
          prev
        </Button>
        <div>
          {paginate.page} / {paginate.totalPages}
        </div>
        <Button onClick={paginate.next} className="border px" variant="sm">
          next
        </Button>
      </div>

      <table>
        <thead>
          <tr>
            <th
              onClick={() => sorter("name")}
              onKeyUp={() => sorter("name")}
              className="cursor-pointer"
            >
              Prefix
            </th>
            <th className="text-center">Object</th>
            <th
              className="text-center cursor-pointer"
              onClick={() => sorter("size")}
              onKeyUp={() => sorter("size")}
            >
              Size
            </th>
          </tr>
        </thead>
        <tbody>
          {paginate.data.map((obj) => {
            const parts = obj.name.split("/");
            const filename = parts.pop();
            return (
              <tr key={obj.id}>
                <td className="group-h">
                  {<span>/</span>}
                  {parts.map((p) => (
                    <div key={`${obj.id}-${p}`} className="group-h">
                      <span>{p}</span>
                      <span>/</span>
                    </div>
                  ))}
                </td>
                <td className="text-center">
                  <ExternalLink href={`${url}/${obj.name}`} rel="noreferrer">
                    {filename}
                  </ExternalLink>
                </td>
                <td className="text-center">{obj.size}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
