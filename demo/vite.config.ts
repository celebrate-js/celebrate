import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // demo/index.html（ドキュメント本体）とdemo/popit.html（ポップイットを切り出した
      // 単体アプリ）の2エントリをビルド対象にする（複数HTMLエントリの構成）。
      input: {
        main: resolve(__dirname, "index.html"),
        popit: resolve(__dirname, "popit.html"),
      },
    },
  },
});
