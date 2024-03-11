/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_API: boolean;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
