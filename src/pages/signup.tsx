import { homeUrl } from "@app/router";
import { SignupForm } from "@app/shared";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

export function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const onSuccess = () => {
    if (redirect && redirect.startsWith("/")) {
      navigate(redirect);
    } else {
      navigate(homeUrl());
    }
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
