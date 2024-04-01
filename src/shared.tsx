import {
  pgsDetailUrl,
  plusUrl,
  proseDetailUrl,
  proseUrl,
  upsertPubkeyUrl,
  upsertTokenUrl,
} from "@app/router";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import {
  useApi,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
} from "starfx/react";
import {
  VisitInterval,
  VisitUrl,
  fetchOrCreateToken,
  registerUser,
  schema,
  selectFeatureByName,
  selectHasPlus,
  selectHasRegistered,
  selectPostsBySpace,
  selectPubkeysAsList,
  selectYearlyIntervals,
  toggleAnalytics,
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
  const hasPlus = useSelector(selectHasPlus);
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

export function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>logo</title>
      <path
        id="logo"
        d="M107.301 39C111.645 46.5241 113.954 55.0503 113.999 63.7382C114.045 72.4262 111.826 80.9761 107.561 88.5452C103.296 96.1144 97.1319 102.442 89.677 106.903C82.222 111.365 73.7332 113.807 65.047 113.989C56.3608 114.171 47.7772 112.086 40.1419 107.941C32.5067 103.795 26.0835 97.7316 21.5053 90.3476C16.9271 82.9637 14.3519 74.5142 14.0336 65.832C13.7152 57.1497 15.6647 48.5344 19.6899 40.835L64 64L107.301 39Z"
        stroke="#414558"
        strokeWidth="12"
      />
    </svg>
  );
}

function IntervalItem({ interval }: { interval: VisitInterval }) {
  return (
    <div className="group-h">
      <IntervalTitle interval={interval} />
      {interval.visitors}
    </div>
  );
}

function IntervalTitle({ interval }: { interval: VisitInterval }) {
  const post = useSelector((s) =>
    schema.posts.selectById(s, { id: interval.post_id }),
  );
  const project = useSelector((s) =>
    schema.projects.selectById(s, { id: interval.project_id }),
  );
  if (project.id) {
    return (
      <div>
        <Link to={pgsDetailUrl(project.name)}>{project.name}</Link>
      </div>
    );
  }
  if (post.id) {
    return (
      <div>
        <Link to={proseDetailUrl(post.id)}>{post.title}</Link>
      </div>
    );
  }
  return (
    <div>
      <Link to={proseUrl()}>blog</Link>
    </div>
  );
}

export function UniqueVisitorsBox({
  intervals,
}: { intervals: VisitInterval[] }) {
  return (
    <div className="box group flex-1">
      <h3 className="text-lg">Unique Visitors (this month)</h3>
      <div>
        {intervals.map((interval) => {
          return (
            <IntervalItem
              key={`${interval.interval}${interval.post_id}${interval.project_id}`}
              interval={interval}
            />
          );
        })}
      </div>
    </div>
  );
}

export function UniqueVisitorsByTimeBox({
  intervals,
}: { intervals: VisitInterval[] }) {
  return (
    <div className="box group flex-1">
      <h3 className="text-lg">Unique Visitors (this month)</h3>
      <div>
        {intervals.map((interval) => {
          return (
            <IntervalTime
              key={`${interval.interval}${interval.post_id}${interval.project_id}`}
              interval={interval}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TopSiteUrls({ urls }: { urls: VisitUrl[] }) {
  return (
    <div className="box group flex-1">
      <h3 className="text-lg">Top Site URLs (this month)</h3>
      <div>
        {urls.map((interval) => {
          return (
            <div key={interval.url}>
              {interval.url} {interval.count}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopReferers({ referers }: { referers: VisitUrl[] }) {
  return (
    <div className="box group flex-1">
      <h3 className="text-lg">Top Referers (this month)</h3>
      <div>
        {referers.map((interval, idx) => {
          if (!interval.url) return null;
          return (
            <div key={`${interval.url}${idx}`}>
              <ExternalLink href={`//${interval.url}`}>
                {interval.url}
              </ExternalLink>{" "}
              {interval.count}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SummaryAnalyticsView() {
  const hasAnalytics = useSelector((s) =>
    selectFeatureByName(s, { name: "analytics" }),
  );
  const summary = useSelector(schema.analyticsYearly.select);
  const intervals = useSelector(selectYearlyIntervals).slice(0, 10);
  const urls = [...summary.top_urls].sort((a, b) => b.count - a.count);
  const refs = [...summary.top_referers].sort((a, b) => b.count - a.count);

  if (!hasAnalytics) {
    return <AnalyticsSettings />;
  }

  return (
    <div className="group">
      <UniqueVisitorsBox intervals={intervals} />

      <div className="flex gap">
        <TopSiteUrls urls={urls} />
        <TopReferers referers={refs} />
      </div>
    </div>
  );
}

const truncateDate = (dateStr: string): string => {
  const ds = dateStr.split("T");
  return ds[0];
};

export function IntervalTime({ interval }: { interval: VisitInterval }) {
  return (
    <div>
      {truncateDate(interval.interval)} {interval.visitors}
    </div>
  );
}

export function AnalyticsSettings() {
  const hasPlus = useSelector(selectHasPlus);
  const hasAnalytics = useSelector((s) =>
    selectFeatureByName(s, { name: "analytics" }),
  );
  const dispatch = useDispatch();
  const action = toggleAnalytics();
  const onToggle = () => {
    dispatch(action);
  };
  const loader = useLoader(action);

  const btn = hasAnalytics ? (
    <div className="group-h">
      <div className="font-bold">Analytics is enabled.</div>
      <Button onClick={onToggle} variant="sm" isLoading={loader.isLoading}>
        Disable Analytics
      </Button>
    </div>
  ) : (
    <div className="group-h">
      <div className="font-bold">Analytics is disabled.</div>
      <Button onClick={onToggle} variant="sm" isLoading={loader.isLoading}>
        Enable Analytics
      </Button>
    </div>
  );

  return (
    <div className="box group">
      <BannerLoader {...loader} />

      <Banner>Analytics are a work in progress</Banner>

      <div>
        Get usage statistics on your blog, blog posts, and pages sites. Unique
        visitors, most popular URLs, and top referers are a couple of examples
        of our stats. You can read more about analytics from our{" "}
        <ExternalLink href="https://pico.sh/privacy#analytics">
          privacy policy
        </ExternalLink>
        .
      </div>

      <div>
        We do not collect usage statistic unless analytics is enabled. Further,
        when analytics are disabled we do not purge usage statistics.
      </div>

      <div>
        We will only store usage statistics for 1 year from when the event was
        created.
      </div>

      {hasPlus ? (
        btn
      ) : (
        <Banner>
          Analytics is a <Link to={plusUrl()}>pico+</Link> feature.
        </Banner>
      )}
    </div>
  );
}
