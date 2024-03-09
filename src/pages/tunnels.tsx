import { selectHasRegistered, useSelector } from "@app/api";
import { homeUrl } from "@app/router";
import { SignupForm } from "@app/shared";
import { useNavigate } from "react-router";

export function Exposition() {
  return (
    <div>
      <p>
        By leveraging SSH tunnels, we can use pubkey cryptography to
        authenticate users on the web. No passwords, no JWTs, no bearer tokens,
        no complicated webauthn, and no passkeys. All we need is an SSH keypair.
      </p>

      <p>
        Let that sink in. We can build APIs without worrying about
        authentication. The API isn't publicly accessible all. No one can try to
        exploit it except for registered users. Of course the catch is that our
        users need to be able to run ssh commands. But if we can operate under
        that assumption, this is great DX and UX.
      </p>

      <p>
        Pretty sweet, huh? With that we are excited to introduce everyone to{" "}
        <a href="https://github.com/picosh/ptun">ptun</a>, a golang library that
        will serve your website over an SSH tunnel.
      </p>

      <p className="m-0 mb-2">
        Web tunnels can be used in many interesting ways. For example, we
        created <a href="https://pico.sh/imgs">imgs.sh</a> which is a docker
        image registry authenticated via SSH. <code>docker push</code> and
        <code>docker pull</code> work the exact same, because all we do is proxy
        the registry service through an SSH tunnel.
      </p>

      <p className="m-0 mb-2">
        We also use web tunnels to serve private sites on{" "}
        <a href="pgs.sh">pgs.sh</a> which is our static hosting platform.
      </p>

      <hr />
    </div>
  );
}

export function TunnelsPage() {
  const navigate = useNavigate();
  const onSuccess = () => {
    navigate(homeUrl());
  };

  return (
    <div className="flex justify-center">
      <div className="flex justify-center mt-4 container-sm">
        <div className="group">
          <div className="text-center group">
            <div>
              <h1 className="logo-header text-2xl">pico</h1>
            </div>
            <div className="text-center text-lg">hacker labs</div>
          </div>

          <Exposition />

          <div className="box mb-8">
            <h3 className="text-lg">Interested in pico.sh?</h3>

            <p>
              At pico, we are constantly experimenting with tools to improve
              communication and collaboration on the web.
            </p>

            <p>
              We are a hacker lab, passionate about providing premium services
              we desparately want to exist.
            </p>

            <SignupForm onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
