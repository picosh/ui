import {
  type Project,
  fetchProjects,
  getProjectUrl,
  isProjectLinked,
  schema,
  selectProjectsAsList,
  useSelector,
} from "@app/api";
import { prettyDate } from "@app/date";
import { pgsDetailUrl } from "@app/router";
import { ExternalLink, PageHeader } from "@app/shared";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "starfx/react";

type SortDir = "asc" | "desc";

function createSortProjects(sortBy: keyof Project, sortDir: SortDir) {
  return (a: Project, b: Project) => {
    if (sortBy === "name") {
      if (sortDir === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    }

    if (sortBy === "project_dir") {
      const isLinkedA = isProjectLinked(a);
      const isLinkedB = isProjectLinked(b);
      if (!isLinkedA) {
        return 1;
      }
      if (!isLinkedB) {
        return -1;
      }
      if (sortDir === "asc") {
        return a.project_dir.localeCompare(b.project_dir);
      }
      return b.project_dir.localeCompare(a.project_dir);
    }

    if (sortBy === "acl") {
      if (sortDir === "asc") {
        return a.acl.type.localeCompare(b.acl.type);
      }
      return b.acl.type.localeCompare(a.acl.type);
    }

    if (sortBy === "updated_at") {
      const aDate = new Date(a.updated_at).getTime();
      const bDate = new Date(b.updated_at).getTime();
      if (sortDir === "asc") {
        return aDate - bDate;
      }
      return bDate - aDate;
    }

    const aDate = new Date(a.created_at).getTime();
    const bDate = new Date(b.created_at).getTime();
    if (sortDir === "asc") {
      return aDate - bDate;
    }
    return bDate - aDate;
  };
}

function ProjectsTable() {
  const user = useSelector(schema.user.select);
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sortBy, setSortBy] = useState<keyof Project>("updated_at");
  const sorter = (by: keyof Project) => {
    setSortDir(sortDir === "asc" ? "desc" : "asc");
    setSortBy(by);
  };
  const sortFn = createSortProjects(sortBy, sortDir);
  const projects = useSelector(selectProjectsAsList)
    .filter((proj) => {
      if (search === "") {
        return true;
      }
      const match = proj.name
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase());
      return match;
    })
    .sort(sortFn);

  return (
    <div className="group">
      <input
        placeholder="Search for sites"
        value={search}
        onChange={(ev) =>
          setParams({ search: ev.currentTarget.value }, { replace: true })
        }
      />
      <table className="w-full box overflow-x-scroll">
        <thead>
          <tr>
            <th
              onClick={() => sorter("name")}
              onKeyUp={() => sorter("name")}
              className="cursor-pointer text-left"
            >
              Name
            </th>
            <th className="text-left">Site</th>
            <th
              onClick={() => sorter("project_dir")}
              onKeyUp={() => sorter("project_dir")}
              className="cursor-pointer text-left"
            >
              Links To
            </th>
            <th
              onClick={() => sorter("created_at")}
              onKeyUp={() => sorter("created_at")}
              className="cursor-pointer text-left"
            >
              Created At
            </th>
            <th
              onClick={() => sorter("updated_at")}
              onKeyUp={() => sorter("updated_at")}
              className="cursor-pointer text-left"
            >
              Updated At
            </th>
            <th
              onClick={() => sorter("name")}
              onKeyUp={() => sorter("name")}
              className="cursor-pointer text-center"
            >
              ACL Type
            </th>
            <th className="text-left">ACL</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                No projects!
              </td>
            </tr>
          ) : null}
          {projects.map((project) => {
            const { type, data = [] } = project.acl;
            return (
              <tr key={project.id}>
                <td className="text-left">
                  <Link to={pgsDetailUrl(project.name)}>{project.name}</Link>
                </td>
                <td className="text-left">
                  <ExternalLink href={getProjectUrl(user, project)}>
                    Site
                  </ExternalLink>
                </td>
                <td className="text-left">
                  {isProjectLinked(project) ? (
                    <Link to={pgsDetailUrl(project.project_dir)}>
                      {project.project_dir}
                    </Link>
                  ) : null}
                </td>
                <td className="text-left">{prettyDate(project.created_at)}</td>
                <td className="text-left">{prettyDate(project.updated_at)}</td>
                <td className="text-center">{type}</td>
                <td className="text-left">{data?.join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PgsPage() {
  useQuery(fetchProjects());

  return (
    <div className="group">
      <PageHeader title="Pages" docsUrl="/pgs" />
      <ProjectsTable />
    </div>
  );
}
