-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "condition" TEXT,
ADD COLUMN     "isNegotiable" BOOLEAN NOT NULL DEFAULT false;

-- 기존 상품 백필: 등록 폼이 설명 끝에 글자로 붙이던 꼬리표를 필드로 옮기고 설명에서 지운다.
--   꼬리표 형식: <설명>\n\n---\n상태: <라벨> · 가격 협상: <가능|불가>
--   라벨 매핑: 새 상품 → new, 거의 새것 → like-new, 사용감 적음 → good, 사용감 있음 → used (상태 미입력은 null)
--   설명 끝에 이 형식이 없으면 그 설명은 건드리지 않는다. 가격이 없는 상품은 협상 가능으로 본다.
-- test/api/market-backfill.test.ts가 아래 표시 사이의 SQL을 읽어 그대로 실행한다. 문장은 세미콜론으로 끝낸다.
-- backfill:start
UPDATE "Market" AS m
SET
    "condition" = CASE t.tag[2]
        WHEN '새 상품' THEN 'new'
        WHEN '거의 새것' THEN 'like-new'
        WHEN '사용감 적음' THEN 'good'
        WHEN '사용감 있음' THEN 'used'
    END,
    "isNegotiable" = (t.tag[3] = '가능' OR m."price" IS NULL),
    "description" = t.tag[1]
FROM (
    SELECT
        "id",
        regexp_match(
            "description",
            E'^(.*)\n\n---\n상태: (새 상품|거의 새것|사용감 적음|사용감 있음|상태 미입력) · 가격 협상: (가능|불가)[[:space:]]*$'
        ) AS tag
    FROM "Market"
) AS t
WHERE m."id" = t."id" AND t.tag IS NOT NULL;

UPDATE "Market" SET "isNegotiable" = true WHERE "price" IS NULL;
-- backfill:end
