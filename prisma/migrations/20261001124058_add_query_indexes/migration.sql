-- CreateIndex
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatRoomMember_userId_idx" ON "ChatRoomMember"("userId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Market_userId_idx" ON "Market"("userId");

-- CreateIndex
CREATE INDEX "MarketImage_marketId_idx" ON "MarketImage"("marketId");

-- CreateIndex
CREATE INDEX "MarketLike_marketId_idx" ON "MarketLike"("marketId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "PostImage_postId_idx" ON "PostImage"("postId");
