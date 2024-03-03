import { useState } from "react";
import { useApi } from "starfx/react";
import { registerUser, selectHasRegistered, useSelector } from "./api";
import { Layout } from "./layout";
import { PlusPage } from "./plus";
import { BannerLoader, Button } from "./shared";

function SignupPage() {
  const [name, setName] = useState("");
  const loader = useApi(registerUser({ name }));
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    loader.trigger();
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen w-screen">
      <div>
        <div className="text-center mb-4 group">
          <div>
            <h1 className="logo-header text-2xl">pico</h1>
          </div>
          <div className="text-center text-lg">hacker labs</div>
        </div>

        <div className="box">
          <form onSubmit={onSubmit} className="group">
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
              Register
            </Button>
            <p>
              By registering you agree to our{" "}
              <a href="https://pico.sh/ops">terms of service</a> and{" "}
              <a href="https://pico.sh/privacy">privacy policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const hasRegistered = useSelector(selectHasRegistered);
  return (
    <Layout>
      {hasRegistered ? <PlusPage /> : <SignupPage />}
    </Layout>
  );
}
