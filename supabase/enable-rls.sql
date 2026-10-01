-- public 스키마 테이블에 RLS를 켜서, 브라우저에 공개된 anon 키로 테이블을 직접 읽지 못하게 한다.
--
-- 왜: 앱의 DB 접근은 모두 서버의 Prisma(테이블 소유자인 postgres 역할)로 하지만, Supabase는 public
-- 스키마를 PostgREST로도 노출한다. RLS가 꺼져 있으면 anon 키만으로
-- `GET $NEXT_PUBLIC_SUPABASE_URL/rest/v1/ChatMessage?select=*` 처럼 모든 행을 읽을 수 있다.
--
-- 영향:
-- - Prisma는 테이블 소유자로 접속하므로 RLS를 우회한다(FORCE ROW LEVEL SECURITY는 쓰지 않는다).
-- - 브라우저가 DB를 직접 읽는 곳은 Realtime의 ChatMessage INSERT 구독(src/lib/hooks/use-chat-realtime.ts)뿐이라,
--   ChatMessage에만 "그 채팅방 멤버만 읽기" 정책을 둔다. 그 외 테이블은 정책 없이 anon/authenticated 접근이 막힌다.
--
-- 적용 방법: Supabase 대시보드 > SQL Editor에서 실행한다. 가능하면 스테이징 프로젝트에서 먼저 실행하고
-- 채팅 실시간 수신이 그대로 되는지 확인한다. 여러 번 실행해도 결과가 같으므로, Prisma 마이그레이션으로
-- 테이블을 추가한 뒤에도 다시 실행한다.
--
-- 적용 전후 확인:
--   select relname, relrowsecurity from pg_class
--   where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1;
--
-- 되돌리기:
--   drop policy if exists "chat room members can read messages" on public."ChatMessage";
--   drop function if exists public.is_chat_room_member(text);
--   그리고 각 테이블에 alter table public."<테이블>" disable row level security;

begin;

do $$
declare
	t record;
begin
	for t in select tablename from pg_tables where schemaname = 'public' loop
		execute format('alter table public.%I enable row level security', t.tablename);
	end loop;
end
$$;

-- 정책 안의 하위 쿼리도 RLS를 받으므로, 멤버 확인은 소유자 권한으로 실행되는 함수에서 한다.
create or replace function public.is_chat_room_member(room_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (
		select 1
		from public."ChatRoomMember" m
		join public."User" u on u.id = m."userId"
		where m."roomId" = room_id
			and u."supabaseId" = (select auth.uid())::text
	);
$$;

revoke all on function public.is_chat_room_member(text) from public;
grant execute on function public.is_chat_room_member(text) to authenticated;

drop policy if exists "chat room members can read messages" on public."ChatMessage";
create policy "chat room members can read messages"
	on public."ChatMessage"
	for select
	to authenticated
	using (public.is_chat_room_member("roomId"));

commit;
