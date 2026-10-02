import { defineConfig, env } from "prisma/config";

// Node 내장 .env 로더(dotenv 대체). CI처럼 .env 없이 환경변수만 주어지면 파일이 없어 예외가 나므로 무시한다.
try {
	process.loadEnvFile();
} catch {}

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: env("DIRECT_URL"),
	},
});
