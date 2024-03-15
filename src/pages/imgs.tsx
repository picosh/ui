import { schema, useSelector } from "@app/api";
import { fetchImageRepos } from "@app/docker";
import { useState } from "react";
import { useQuery } from "starfx/react";

export function ImgsPage() {
  useQuery(fetchImageRepos());
  const repos = useSelector(schema.imageRepos.selectTableAsList);
  const config = useSelector(schema.config.select);
  const [dockerUrl, setDockerUrl] = useState(config.dockerUrl);

  return (
    <div className="group">
      <h2 className="text-xl">Docker Repositories</h2>

      <div>
        Not seeing your repos? You might need to establish a tunnel to imgs.sh:
      </div>

      <div>
        <code>ssh -L 1338:localhost:80 -N imgs.sh</code>
      </div>

      <div>
        <input
          type="text"
          value={dockerUrl}
          onChange={(ev) => setDockerUrl(ev.currentTarget.value)}
        />
      </div>

      <table className="w-full box overflow-x-scroll">
        <thead>
          <tr>
            <th className="text-left">Name</th>
          </tr>
        </thead>
        <tbody>
          {repos.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">
                No repos!
              </td>
            </tr>
          ) : null}
          {repos.map((post) => {
            return (
              <tr key={post.id}>
                <td className="text-left">{post.id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
