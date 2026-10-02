-- 상품에 그룹·멤버 태그를 붙인다. 기존 상품은 태그 없음(NULL)으로 남고 백필은 없다.
-- 그룹이나 아티스트가 지워지면 상품은 그대로 두고 태그만 풀린다(ON DELETE SET NULL).

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "artistId" TEXT,
ADD COLUMN     "groupId" TEXT;

-- CreateIndex
CREATE INDEX "Market_groupId_idx" ON "Market"("groupId");

-- CreateIndex
CREATE INDEX "Market_artistId_idx" ON "Market"("artistId");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ArtistGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
