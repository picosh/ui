import {
  ProjectObject,
  deserializeAnalytics,
  fetchMonthlyAnalyticsByProject,
  fetchProjectObjects,
  getProjectUrl,
  isProjectLinked,
  objectSort,
  schema,
  selectFeatureByName,
  selectObjectsByProjectName,
  selectProjectByName,
  useSelector,
} from "@app/api";
import { prettyDate } from "@app/date";
import { usePaginate } from "@app/paginate";
import { pgsDetailUrl, pgsUrl } from "@app/router";
import {
  AnalyticsSettings,
  Breadcrumbs,
  Button,
  ExternalLink,
  TopReferers,
  TopSiteUrls,
  UniqueVisitorsByTimeBox,
} from "@app/shared";
import { useState } from "react";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useCache, useQuery } from "starfx/react";

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
  const { data } = useCache(
    fetchMonthlyAnalyticsByProject({ projectId: project.id }),
  );
  const analytics = deserializeAnalytics(data);
  const projectName = project.name;

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: pgsUrl(), text: "pgs" }]}
        text={projectName}
      />

      <div className="box group">
        <dl style={{ columnCount: 2 }}>
          <dt>ID</dt>
          <dd>
            <code>{project.id}</code>
          </dd>

          <dt>Site</dt>
          <dd>
            <ExternalLink href={getProjectUrl(user, project)}>
              View
            </ExternalLink>
          </dd>

          <dt>Links To</dt>
          <dd>
            {isProjectLinked(project) ? (
              <Link to={pgsDetailUrl(project.project_dir)}>
                {project.project_dir}
              </Link>
            ) : null}
          </dd>

          <dt>Created At</dt>
          <dd>{prettyDate(project.created_at)}</dd>

          <dt>Updated At</dt>
          <dd>{prettyDate(project.updated_at)}</dd>

          <dt>ACL Type</dt>
          <dd>{project.acl.type}</dd>

          <dt>ACL</dt>
          <dd>{project.acl.data?.join(",") || "N/A"}</dd>
        </dl>
      </div>

      {hasAnalytics ? (
        <>
          <UniqueVisitorsByTimeBox intervals={analytics.intervals} />

          <div className="flex gap">
            <TopSiteUrls urls={analytics.urls} />
            <TopReferers referers={analytics.refs} />
          </div>
        </>
      ) : (
        <AnalyticsSettings />
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
