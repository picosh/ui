import { plusUrl } from "@app/router";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi, useLoaderSuccess, useQuery } from "starfx/react";
import { fetchOrCreateToken, registerUser, schema, useSelector } from "./api";

const bytesToMb = (num: number) => num / 1000 / 1000;
const bytesToGb = (num: number) => bytesToMb(num) / 1000;

export function Banner({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function BannerLoader({
  isLoading,
  isError,
  message,
}: { isLoading?: boolean; isError?: boolean; message: string }) {
  if (isLoading) return null;
  if (!isError) return null;
  return <Banner>{message}</Banner>;
}

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isLoading?: boolean;
}
export function Button({
  children,
  isLoading = false,
  type,
  className,
  ...rest
}: ButtonProps) {
  const cls = `${className}`;
  if (isLoading) {
    return (
      <button {...rest} type={type} className={cls} disabled>
        loading...
      </button>
    );
  }
  return (
    <button {...rest} type={type} className={cls}>
      {children}
    </button>
  );
}

export const PubkeyView = ({ pubkey }: { pubkey: string }) => {
  return <code className="text-xs">{pubkey}</code>;
};

export const RssBox = () => {
  useQuery(fetchOrCreateToken());
  const token = useSelector(schema.rssToken.select);

  return (
    <div className="box">
      <h3 className="text-lg" id="membership-notifications">
        Membership Notifications
      </h3>

      <p>
        We provide a special RSS feed for all pico users in order for us to send
        direct notifications to users. This is where we will send you{" "}
        <code>pico+</code> expiration notifications. To be clear, this is opt-in
        and highly recommended.
      </p>

      <pre>https://auth.pico.sh/rss/{token}</pre>

      <h4 className="text-md">
        <a href="https://pico.sh/feeds">feeds.sh</a>
      </h4>
      <p>
        Create a file to be uploaded to feeds (<code>pico.txt</code>):
      </p>

      <pre>{`=: email rss@myemail.com
=: digest_interval 1day
=> https://auth.pico.sh/rss/${token}`}</pre>

      <pre>rsync pico.txt feeds.sh:/</pre>
    </div>
  );
};

export function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const loader = useApi(registerUser({ name }));
  const user = useSelector(schema.user.select);
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    loader.trigger();
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} className="group">
      <div className="font-bold">pubkey</div>

      <div>
        <PubkeyView pubkey={user.pubkey} />
      </div>

      <label htmlFor="name">username</label>

      <input
        type="text"
        name="name"
        placeholder="Enter username"
        value={name}
        className="text-md"
        onChange={(ev) => setName(ev.currentTarget.value)}
      />

      <BannerLoader {...loader} />

      <Button type="submit" isLoading={loader.isLoading} className="btn">
        Signup
      </Button>

      <p>
        By signing up for a pico account you agree to our{" "}
        <a href="https://pico.sh/ops">terms of service</a> and{" "}
        <a href="https://pico.sh/privacy">privacy policy</a>.
      </p>
    </form>
  );
}

export function FeaturesTable() {
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
    <table className="w-full box">
      <thead>
        <tr>
          <th className="text-left">Feature</th>
          <th className="text-left">Expiration</th>
          <th className="text-center">Storage Max (GB)</th>
          <th className="text-center">File Max (MB)</th>
        </tr>
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

export function PubkeysTable() {
  const user = useSelector(schema.user.select);
  const pubkeys = useSelector(schema.pubkeys.selectTableAsList);
  return (
    <table className="w-full box">
      <thead>
        <tr>
          <th className="text-left">Key</th>
          <th className="text-left">Created At</th>
        </tr>
      </thead>
      <tbody>
        {pubkeys.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              No pubkeys?
            </td>
          </tr>
        ) : null}
        {pubkeys.map((pubkey) => {
          return (
            <tr key={pubkey.id}>
              <td className="text-left">
                {pubkey.key === user.pubkey ? "*" : ""}{" "}
                <PubkeyView pubkey={pubkey.key} />
              </td>
              <td className="text-left">
                {new Date(pubkey.created_at).toDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function TokensTable() {
  const tokens = useSelector(schema.tokens.selectTableAsList);
  return (
    <table className="w-full box">
      <thead>
        <tr>
          <th className="text-left">Name</th>
          <th className="text-left">Created At</th>
          <th className="text-left">Expires At</th>
        </tr>
      </thead>
      <tbody>
        {tokens.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              No tokens found
            </td>
          </tr>
        ) : null}
        {tokens.map((token) => {
          return (
            <tr key={token.id}>
              <td className="text-left">{token.name}</td>
              <td className="text-left">
                {new Date(token.created_at).toDateString()}
              </td>
              <td className="text-left">
                {new Date(token.expires_at).toDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function UserBox() {
  const user = useSelector(schema.user.select);
  return (
    <div className="box">
      <div className="font-bold">pubkey</div>
      <div>
        <PubkeyView pubkey={user.pubkey} />
      </div>

      <div className="font-bold">username</div>
      <div>
        <code>{user.username}</code>
      </div>
    </div>
  );
}
