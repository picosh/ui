/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_API: string;
  readonly VITE_API_URL: string;
  readonly VITE_DOCKER_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
