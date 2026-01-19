/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  cheat_charmander?: () => void;
  cheat_charmander_lv35?: () => void;
}
