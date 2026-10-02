-- AlterTable
ALTER TABLE "ChatRoomMember" ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- 기존 멤버 백필: 이 기능이 생기기 전의 대화는 모두 읽은 것으로 본다.
--   채우지 않으면 배포 직후 모든 사용자의 지난 대화가 안 읽음으로 뜬다(lastReadAt이 null이면 방의 메시지 전체를 센다).
--   각 방의 마지막 메시지 시각으로 채우고, 메시지가 없는 방은 입장 시각으로 채운다.
-- test/api/chat-unread.test.ts가 아래 표시 사이의 SQL을 읽어 그대로 실행한다. 문장은 세미콜론으로 끝낸다.
-- backfill:start
UPDATE "ChatRoomMember" AS crm
SET "lastReadAt" = COALESCE(
    (SELECT MAX(m."createdAt") FROM "ChatMessage" AS m WHERE m."roomId" = crm."roomId"),
    crm."joinedAt"
)
WHERE crm."lastReadAt" IS NULL;
-- backfill:end
