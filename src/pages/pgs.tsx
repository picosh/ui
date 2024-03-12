import {
  Project,
  fetchProjects,
  getProjectUrl,
  schema,
  selectProjectsAsList,
  useSelector,
} from "@app/api";
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
            <td colSpan={4} className="text-center">
              No projects!
            </td>
          </tr>
        ) : null}
        {projects.map((project) => {
          return (
            <tr key={project.id}>
              <td className="text-left">
                <a href={getProjectUrl(user, project)}>{project.name}</a>
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
              <td className="text-center">{project.acl.type}</td>
              <td className="text-left">{project.acl.data.join(", ")}</td>
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
      <h2 className="text-xl">Projects</h2>
      <ProjectsTable />
    </div>
  );
}
