import { schema, useSelector } from "@app/api";
import { fetchImageTags } from "@app/docker";
import { imgsUrl } from "@app/router";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useQuery } from "starfx/react";

export function ImgsDetailPage() {
  const { name = "" } = useParams();
  useQuery(fetchImageTags({ name }));
  const repo = useSelector((s) =>
    schema.imageRepos.selectById(s, { id: name }),
  );
  return (
    <div className="box group">
      <h2 className="text-xl">
        <Link to={imgsUrl()}>imgs</Link> / {repo.id}
      </h2>

      <table>
        <thead>
          <tr>
            <th className="text-left">Tag</th>
          </tr>
        </thead>
        <tbody>
          {repo.tags.map((tag) => {
            return (
              <tr key={tag}>
                <td className="text-left">{tag}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
