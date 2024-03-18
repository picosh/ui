import { schema, updateDockerConfig, useSelector } from "@app/api";
import { fetchImageRepos } from "@app/docker";
import { imgsDetailUrl } from "@app/router";
import { Button, PageHeader } from "@app/shared";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useQuery } from "starfx/react";

export function ImgsPage() {
  useQuery(fetchImageRepos());
  const dispatch = useDispatch();
  const repos = useSelector(schema.imageRepos.selectTableAsList);
  const config = useSelector(schema.config.select);
  const [dockerUrl, setDockerUrl] = useState(config.dockerUrl);
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    dispatch(updateDockerConfig({ url: dockerUrl }));
  };
  const parts = config.dockerUrl.split(":");
  const port = parts.pop();

  return (
    <div className="group">
      <PageHeader title="Docker Images" docsUrl="/imgs" />

      <div className="box group">
        <form onSubmit={onSubmit} className="group-h">
          <label htmlFor="config">Docker API</label>
          <input
            id="config"
            name="config"
            type="text"
            value={dockerUrl}
            onChange={(ev) => setDockerUrl(ev.currentTarget.value)}
          />
          <Button
            type="submit"
            className="border"
            style={{ padding: "0.1rem 0.5rem" }}
          >
            update
          </Button>
        </form>

        <div>
          Not seeing your repos? You might need to establish a separate tunnel
          to imgs.sh:
        </div>

        <div>
          <code>ssh -L {port}:localhost:80 -N imgs.sh</code>
        </div>
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
                <td className="text-left">
                  <Link to={imgsDetailUrl(post.id)}>{post.id}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
