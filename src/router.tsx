import { createBrowserRouter } from "react-router-dom";
import { AuthRequired } from "./auth.tsx";
import { Layout } from "./layout.tsx";
import {
  HomePage,
  ImgsPage,
  PastesPage,
  PgsPage,
  PlusPage,
  ProsePage,
  SettingsPage,
  SignupPage,
  SuccessPage,
  TunnelsPage,
} from "./pages";

const HOME_PATH = "/";
export const homeUrl = () => HOME_PATH;

const SIGNUP_PATH = "/signup";
export const signupUrl = (redirect = "") => {
  if (redirect === "" || !redirect.startsWith("/")) {
    return SIGNUP_PATH;
  }
  return `${SIGNUP_PATH}?redirect=${redirect}`;
};

const PLUS_PATH = "/plus";
export const plusUrl = () => PLUS_PATH;

const IMGS_PATH = "/imgs";
export const imgsUrl = () => IMGS_PATH;

const PASTES_PATH = "/pastes";
export const pastesUrl = () => PASTES_PATH;

const PGS_PATH = "/pgs";
export const pgsUrl = () => PGS_PATH;

const PROSE_PATH = "/prose";
export const proseUrl = () => PROSE_PATH;

const SETTINGS_PATH = "/settings";
export const settingsUrl = () => SETTINGS_PATH;

const SUCCESS_PATH = "/success";
export const successUrl = () => SUCCESS_PATH;

const TUNNELS_PATH = "/tunnels";
export const tunnelsUrl = () => TUNNELS_PATH;

export const router = createBrowserRouter([
  {
    path: HOME_PATH,
    element: (
      <AuthRequired>
        <Layout />
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: PLUS_PATH,
        element: <PlusPage />,
      },
      {
        path: IMGS_PATH,
        element: <ImgsPage />,
      },
      {
        path: PASTES_PATH,
        element: <PastesPage />,
      },
      {
        path: PGS_PATH,
        element: <PgsPage />,
      },
      {
        path: PROSE_PATH,
        element: <ProsePage />,
      },
      {
        path: SETTINGS_PATH,
        element: <SettingsPage />,
      },
    ],
  },

  {
    path: TUNNELS_PATH,
    element: (
      <Layout>
        <TunnelsPage />
      </Layout>
    ),
  },

  {
    path: SUCCESS_PATH,
    element: (
      <Layout>
        <SuccessPage />
      </Layout>
    ),
  },

  {
    path: SIGNUP_PATH,
    element: (
      <Layout>
        <SignupPage />
      </Layout>
    ),
  },
]);
