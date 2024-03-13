import {
  ProjectObject,
  fetchProjectObjects,
  getProjectUrl,
  objectSort,
  schema,
  selectObjectsByProjectName,
  useSelector,
} from "@app/api";
import { usePaginate } from "@app/paginate";
import { pgsUrl } from "@app/router";
import { Button } from "@app/shared";
import { useState } from "react";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "starfx/react";

export function PgsDetailPage() {
  const { name = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const [sortDir, setSortDir] = useState("asc");
  const [sortBy, setSortBy] = useState("name" as keyof ProjectObject);
  const user = useSelector(schema.user.select);
  const url = getProjectUrl(user, { name });
  useQuery(fetchProjectObjects({ name }));
  const objects = useSelector((s) => selectObjectsByProjectName(s, { name }))
    .filter((obj) => {
      if (search === "") {
        return true;
      }
      return obj.name
        .replace("/", "")
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase());
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
  return (
    <div className="group">
      <h2 className="text-xl">
        <Link to={pgsUrl()}>pgs</Link> / {name}
      </h2>
      <input
        value={search}
        onChange={(ev) =>
          setParams({ search: ev.currentTarget.value }, { replace: true })
        }
      />
      <div className="group-h">
        <div>{paginate.totalItems} objects</div>
        <span>&middot;</span>
        <Button onClick={paginate.prev} className="border px">
          prev
        </Button>
        <div>
          {paginate.page} / {paginate.totalPages}
        </div>
        <Button onClick={paginate.next} className="border px">
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
                  <a
                    href={`${url}/${obj.name}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {filename}
                  </a>
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
