import {
  Project,
  fetchProjects,
  getProjectUrl,
  schema,
  selectProjectsAsList,
  useSelector,
} from "@app/api";
import { pgsDetailUrl } from "@app/router";
import { ExternalLink, PageHeader } from "@app/shared";
import { Link } from "react-router-dom";
import { useQuery } from "starfx/react";

function isProjectLinked(project: Project): boolean {
  return project.project_dir !== project.name;
}

function ProjectsTable() {
  const user = useSelector(schema.user.select);
  const projects = useSelector(selectProjectsAsList);
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Name</th>
          <th className="text-left">Site</th>
          <th className="text-left">Links To</th>
          <th className="text-left">Created At</th>
          <th className="text-left">Updated At</th>
          <th className="text-center">ACL Type</th>
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
                {isProjectLinked(project) ? project.project_dir : null}
              </td>
              <td className="text-left">
                {new Date(project.created_at).toDateString()}
              </td>
              <td className="text-left">
                {new Date(project.updated_at).toDateString()}
              </td>
              <td className="text-center">{type}</td>
              <td className="text-left">{data?.join(", ")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
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
