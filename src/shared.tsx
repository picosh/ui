import { useState } from "react";
import { useApi, useLoaderSuccess, useQuery } from "starfx/react";
import { fetchOrCreateToken, registerUser, schema, useSelector } from "./api";

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

      <pre>https://auth.pico.sh/rss/{token.id}</pre>

      <h4 className="text-md">
        <a href="https://pico.sh/feeds">feeds.sh</a>
      </h4>
      <p>
        Create a file to be uploaded to feeds (<code>pico.txt</code>):
      </p>

      <pre>{`=: email rss@myemail.com
=: digest_interval 1day
=> https://auth.pico.sh/rss/${token.id}`}</pre>

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
        <code>{user.pubkey}</code>
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
