import { schema, useSelector } from "@app/api";
import { plusUrl } from "@app/router";
import { Link } from "react-router-dom";

const bytesToMb = (num: number) => num / 1000 / 1000;
const bytesToGb = (num: number) => bytesToMb(num) / 1000;

function FeaturesTable() {
  const features = useSelector(schema.features.selectTableAsList);
  if (features.length === 0) {
    return (
      <div className="group box">
        <div>
          You are not a <code>pico+</code> member.
        </div>
        <div>
          <Link to={plusUrl()} className="btn-link">
            JOIN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full border">
      <thead>
        <th className="text-left">Feature</th>
        <th className="text-left">Expiration</th>
        <th className="text-center">Storage Max (GB)</th>
        <th className="text-center">File Max (MB)</th>
      </thead>
      <tbody>
        {features.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              No features!
            </td>
          </tr>
        ) : null}
        {features.map((feature) => {
          return (
            <tr key={feature.id}>
              <td className="text-left">{feature.name}</td>
              <td className="text-left">
                {new Date(feature.expires_at).toDateString()}
              </td>
              <td className="text-center">
                {bytesToGb(feature.data.storage_max)}
              </td>
              <td className="text-center">
                {bytesToMb(feature.data.file_max)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function HomePage() {
  return (
    <div className="group">
      <h1 className="text-xl">This is the dashboard!</h1>
      <p>This site is still a work in progress.</p>
      <FeaturesTable />
    </div>
  );
}
