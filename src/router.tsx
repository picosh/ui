import { createBrowserRouter } from "react-router-dom";
import { AuthRequired } from "./auth.tsx";
import { Layout } from "./layout.tsx";
import {
  FeedsPage,
  HomePage,
  ImgsDetailPage,
  ImgsPage,
  PastesPage,
  PgsDetailPage,
  PgsPage,
  PlusPage,
  ProsePage,
  SettingsPage,
  SignupPage,
  SuccessPage,
  TunnelsPage,
  UpsertPubkeyPage,
  UpsertTokenPage,
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

const IMGS_DETAIL_PATH = "/imgs/:name";
export const imgsDetailUrl = (repo: string) => `/imgs/${repo}`;

const PASTES_PATH = "/pastes";
export const pastesUrl = () => PASTES_PATH;

const FEEDS_PATH = "/feeds";
export const feedsUrl = () => FEEDS_PATH;

const PGS_PATH = "/pgs";
export const pgsUrl = () => PGS_PATH;

const PGS_DETAIL_PATH = "/pgs/:name";
export const pgsDetailUrl = (name: string) => `/pgs/${name}`;

const PROSE_PATH = "/prose";
export const proseUrl = () => PROSE_PATH;

const SETTINGS_PATH = "/settings";
export const settingsUrl = () => SETTINGS_PATH;

const SUCCESS_PATH = "/success";
export const successUrl = () => SUCCESS_PATH;

const TUNNELS_PATH = "/tunnels";
export const tunnelsUrl = () => TUNNELS_PATH;

const UPSERT_PUBKEY_PATH = "/pubkeys/:id";
export const upsertPubkeyUrl = (id = "new") => `/pubkeys/${id}`;

const UPSERT_TOKEN_PATH = "/tokens/:id";
export const upsertTokenUrl = (id = "new") => `/tokens/${id}`;

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
        path: IMGS_DETAIL_PATH,
        element: <ImgsDetailPage />,
      },
      {
        path: PASTES_PATH,
        element: <PastesPage />,
      },
      {
        path: FEEDS_PATH,
        element: <FeedsPage />,
      },
      {
        path: PGS_PATH,
        element: <PgsPage />,
      },
      {
        path: PGS_DETAIL_PATH,
        element: <PgsDetailPage />,
      },
      {
        path: PROSE_PATH,
        element: <ProsePage />,
      },
      {
        path: SETTINGS_PATH,
        element: <SettingsPage />,
      },
      {
        path: UPSERT_PUBKEY_PATH,
        element: <UpsertPubkeyPage />,
      },
      {
        path: UPSERT_TOKEN_PATH,
        element: <UpsertTokenPage />,
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
