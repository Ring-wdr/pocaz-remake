#!/bin/bash
# Claude Code on the web 세션 준비: 의존성 설치, Next 라우트 타입 생성, 통합 테스트용 로컬 Postgres.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
	exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 세션의 이후 셸 명령에서도 쓰도록 환경변수를 남긴다.
persist() {
	if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
		echo "export $1=\"$2\"" >>"$CLAUDE_ENV_FILE"
	fi
}

# postinstall의 prisma generate는 prisma.config.ts의 env("DIRECT_URL")을 요구한다.
# 코드 생성에는 DB 접속이 필요 없으므로, 값이 설정돼 있지 않을 때만 자리표시 값을 쓴다.
PLACEHOLDER_DB_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
if [ -z "${DIRECT_URL:-}" ]; then
	export DIRECT_URL="$PLACEHOLDER_DB_URL"
	persist DIRECT_URL "$DIRECT_URL"
fi
if [ -z "${DATABASE_URL:-}" ]; then
	export DATABASE_URL="$PLACEHOLDER_DB_URL"
	persist DATABASE_URL "$DATABASE_URL"
fi

bun install
bunx next typegen

# 통합 테스트(bun test)용 로컬 Postgres. 이미지에 서버 바이너리가 있고 root로 실행될 때만 준비한다.
setup_test_db() {
	[ "$(id -u)" = "0" ] || return 1
	id postgres >/dev/null 2>&1 || return 1
	local pg_bin
	pg_bin=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
	[ -n "$pg_bin" ] && [ -x "$pg_bin/initdb" ] || return 1
	local psql_bin="$pg_bin/psql"
	[ -x "$psql_bin" ] || psql_bin=$(command -v psql) || return 1

	local data=/var/lib/postgresql/pocaz-test
	local port=54329
	mkdir -p /var/run/postgresql && chown postgres:postgres /var/run/postgresql
	if [ ! -s "$data/PG_VERSION" ]; then
		su postgres -c "$pg_bin/initdb -D $data -U postgres --auth=trust -E UTF8 --locale=C.UTF-8" >/dev/null
	fi
	if ! su postgres -c "$pg_bin/pg_ctl -D $data status" >/dev/null 2>&1; then
		su postgres -c "$pg_bin/pg_ctl -D $data -l $data/server.log -o '-p $port -k /var/run/postgresql' -w start" >/dev/null
	fi

	local admin_url="postgresql://postgres@127.0.0.1:$port/postgres"
	local test_url="postgresql://postgres@127.0.0.1:$port/pocaz_test"
	if ! "$psql_bin" "$admin_url" -tAc "SELECT 1 FROM pg_database WHERE datname = 'pocaz_test'" | grep -q 1; then
		"$psql_bin" "$admin_url" -qc "CREATE DATABASE pocaz_test"
	fi
	DIRECT_URL="$test_url" bunx prisma migrate deploy >/dev/null
	persist TEST_DATABASE_URL "$test_url"
}

if ! setup_test_db; then
	echo "session-start: 테스트용 Postgres를 준비하지 못했습니다. DB가 필요한 테스트는 건너뜁니다." >&2
fi
