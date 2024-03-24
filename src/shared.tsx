import { plusUrl, upsertPubkeyUrl, upsertTokenUrl } from "@app/router";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useApi, useLoaderSuccess, useQuery } from "starfx/react";
import {
  fetchOrCreateToken,
  registerUser,
  schema,
  selectFeatureByName,
  selectHasRegistered,
  selectPostsBySpace,
  selectPubkeysAsList,
  useSelector,
} from "./api";

const bytesToMb = (num: number) => num / 1000 / 1000;
const bytesToGb = (num: number) => bytesToMb(num) / 1000;

export function Banner({ children }: { children: React.ReactNode }) {
  return <div className="p-1 border-success">{children}</div>;
}
export function BannerLoader({
  isLoading,
  message,
}: {
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  message: string;
}) {
  if (isLoading) return null;
  if (message) {
    return <Banner>{message}</Banner>;
  }
  return null;
}

interface LinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {}

export function ExternalLink({ children, href, ...props }: LinkProps) {
  return (
    <a href={href} target="_blank" {...props}>
      {children}
    </a>
  );
}

export function PageHeader({
  title,
  docsUrl,
}: { title: string; docsUrl?: string }) {
  return (
    <div className="group-h items-center">
      <h2 className="text-xl p-0">{title}</h2>
      {docsUrl ? (
        <ExternalLink
          href={`https://pico.sh${docsUrl}`}
          className="btn-link-sm text-sm"
        >
          docs
        </ExternalLink>
      ) : null}
    </div>
  );
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
  variant = "default",
  ...rest
}: ButtonProps & { variant?: "sm" | "default" }) {
  const cls = `${className} ${
    variant === "sm" ? "btn-link-sm text-sm" : "btn-link"
  }`;
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
  return (
    <div className="text-xs pill" title={pubkey}>
      {pubkey}
    </div>
  );
};

export const RssBox = ({ showTitle = true }: { showTitle?: boolean }) => {
  useQuery(fetchOrCreateToken());
  const token = useSelector(schema.rssToken.select);

  return (
    <div className="box group">
      {showTitle ? (
        <h3 className="text-lg" id="membership-notifications">
          Membership Notifications
        </h3>
      ) : null}

      <div>
        We provide a special RSS feed for all pico users in order for us to send
        direct notifications to users. This is where we will send you{" "}
        <code>pico+</code> expiration notifications. To be clear, this is opt-in
        and highly recommended.
      </div>

      <pre className="m-0">https://auth.pico.sh/rss/{token}</pre>

      <h4 className="text-md m-0">
        <ExternalLink href="https://pico.sh/feeds">feeds.sh</ExternalLink>
      </h4>

      <div>
        Create a file to be uploaded to feeds (<code>pico.txt</code>):
      </div>

      <pre className="m-0">{`=: email rss@myemail.com
=: digest_interval 1day
=> https://auth.pico.sh/rss/${token}`}</pre>

      <pre className="m-0">rsync pico.txt feeds.sh:/</pre>
    </div>
  );
};

export function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const hasRegistered = useSelector(selectHasRegistered);
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

  if (hasRegistered) {
    return (
      <div className="group">
        <div>
          <div className="font-bold">pubkey</div>
          <div>
            <PubkeyView pubkey={user.fingerprint} />
          </div>
        </div>

        <div>
          <div className="font-bold">user</div>
          <div>
            <code>{user.name}</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="group">
      <div className="font-bold">pubkey</div>

      <div>
        <PubkeyView pubkey={user.fingerprint} />
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

      <Button
        type="submit"
        isLoading={loader.isLoading}
        disabled={hasRegistered}
        className="btn"
      >
        Signup
      </Button>

      <p>
        By signing up for a pico account you agree to our{" "}
        <ExternalLink href="https://pico.sh/ops">terms of service</ExternalLink>{" "}
        and{" "}
        <ExternalLink href="https://pico.sh/privacy">
          privacy policy
        </ExternalLink>
        .
      </p>
    </form>
  );
}

export function PlusBox() {
  const hasPlus = useSelector((s) => selectFeatureByName(s, { name: "pgs" }));
  if (hasPlus) return null;
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

export function FeaturesTable() {
  const features = useSelector(schema.features.selectTableAsList);
  return (
    <table className="w-full box overflow-x-scroll">
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
              No features!{" "}
              <Link to={plusUrl()} className="link-alt-hover">
                Enable with pico+
              </Link>
            </td>
          </tr>
        ) : null}
        {features.map((feature) => {
          return (
            <tr key={feature.id}>
              <td className="text-left">
                <div className="pill">{feature.name}</div>
              </td>
              <td className="text-left">
                {new Date(feature.expires_at).toDateString()}
              </td>
              <td className="text-center">
                {bytesToGb(feature.data.storage_max).toFixed(2)}
              </td>
              <td className="text-center">
                {bytesToMb(feature.data.file_max).toFixed(2)}
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
  const pubkeys = useSelector(selectPubkeysAsList);
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Name</th>
          <th className="text-left">Key</th>
          <th className="text-center">Current</th>
          <th className="text-left">Created At</th>
          <th className="text-rigth">Action</th>
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
              <td className="text-left">{pubkey.name}</td>
              <td className="text-left">
                <PubkeyView pubkey={pubkey.key} />
              </td>
              <td className="text-center">
                {pubkey.key === user.fingerprint ? "*" : ""}{" "}
              </td>
              <td className="text-left">
                {new Date(pubkey.created_at).toDateString()}
              </td>
              <td className="text-right">
                <Link
                  to={upsertPubkeyUrl(pubkey.id)}
                  className="btn-link-sm text-sm"
                >
                  edit
                </Link>
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
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Name</th>
          <th className="text-left">Created At</th>
          <th className="text-left">Expires At</th>
          <th className="text-right">Action</th>
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
              <td className="text-right">
                <Link
                  to={upsertTokenUrl(token.id)}
                  className="btn-link-sm text-sm"
                >
                  edit
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function PostsTable({ space }: { space: string }) {
  const posts = useSelector((s) => selectPostsBySpace(s, { space }));
  return (
    <table className="w-full box overflow-x-scroll">
      <thead>
        <tr>
          <th className="text-left">Title</th>
          <th className="text-left">Filename</th>
          <th className="text-center">Status</th>
          <th className="text-left">Published At</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              No posts!
            </td>
          </tr>
        ) : null}
        {posts.map((post) => {
          return (
            <tr key={post.id}>
              <td className="text-left">{post.title}</td>
              <td className="text-left">{post.filename}</td>
              <td className="text-center">
                {post.hidden ? "Unlisted" : "Listed"}
              </td>
              <td className="text-left">
                {new Date(post.publish_at).toDateString()}
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
        <PubkeyView pubkey={user.fingerprint} />
      </div>

      <div className="font-bold">username</div>
      <div>
        <code>{user.name}</code>
      </div>
    </div>
  );
}

export function Form({
  onSubmit,
  className,
  children,
  ...rest
}: React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>) {
  return (
    <form
      {...rest}
      onSubmit={(ev) => {
        ev.preventDefault();
        if (onSubmit) {
          onSubmit(ev);
        }
      }}
      className={`${className} group`}
    >
      {children}
    </form>
  );
}

export function Breadcrumbs({
  crumbs,
  text,
}: { crumbs: { href: string; text: string }[]; text: string }) {
  return (
    <h2 className="text-xl group-h">
      {crumbs.map((cm) => {
        return (
          <Fragment key={cm.href}>
            <Link to={cm.href}>{cm.text}</Link>
            <span>/</span>
          </Fragment>
        );
      })}
      <span>{text}</span>
    </h2>
  );
}
