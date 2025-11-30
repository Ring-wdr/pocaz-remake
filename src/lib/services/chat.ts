import { prisma } from "@/lib/prisma";

/**
 * ChatRoom 생성 DTO
 */
export interface CreateChatRoomDto {
	name?: string;
	memberIds: string[]; // User IDs
	marketId?: string; // Market ID (마켓 거래 관련 채팅방)
}

/**
 * ChatMessage 생성 DTO
 */
export interface CreateChatMessageDto {
	content: string;
	roomId: string;
	userId: string;
}

/**
 * 페이지네이션 옵션
 */
export interface ChatPaginationOptions {
	cursor?: string;
	limit?: number;
}

/**
 * ChatRoom Service
 */
export const chatRoomService = {
	/**
	 * ChatRoom 생성 (멤버 포함)
	 */
	async create(dto: CreateChatRoomDto) {
		return prisma.chatRoom.create({
			data: {
				name: dto.name,
				marketId: dto.marketId,
				members: {
					create: dto.memberIds.map((userId) => ({ userId })),
				},
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				market: {
					select: {
						id: true,
						title: true,
						price: true,
						status: true,
						userId: true,
						images: {
							take: 1,
							select: { imageUrl: true },
						},
					},
				},
				_count: {
					select: {
						messages: true,
					},
				},
			},
		});
	},

	/**
	 * ChatRoom 조회
	 */
	async findById(id: string) {
		return prisma.chatRoom.findUnique({
			where: { id },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				market: {
					select: {
						id: true,
						title: true,
						price: true,
						status: true,
						userId: true,
						images: {
							take: 1,
							select: { imageUrl: true },
						},
					},
				},
				_count: {
					select: {
						messages: true,
					},
				},
			},
		});
	},

	/**
	 * 사용자의 ChatRoom 목록 조회
	 */
	async findByUserId(userId: string, marketId?: string) {
		return prisma.chatRoom.findMany({
			where: {
				members: {
					some: { userId },
				},
				...(marketId && { marketId }),
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				market: {
					select: {
						id: true,
						title: true,
						price: true,
						status: true,
						userId: true,
						images: {
							take: 1,
							select: { imageUrl: true },
						},
					},
				},
				messages: {
					take: 1,
					orderBy: { createdAt: "desc" },
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
							},
						},
					},
				},
				_count: {
					select: {
						messages: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	},

	/**
	 * 1:1 채팅방 조회 또는 생성
	 */
	async findOrCreateDirect(userId1: string, userId2: string) {
		// 기존 1:1 채팅방 찾기
		const existingRoom = await prisma.chatRoom.findFirst({
			where: {
				AND: [
					{ members: { some: { userId: userId1 } } },
					{ members: { some: { userId: userId2 } } },
					{
						members: {
							every: {
								userId: { in: [userId1, userId2] },
							},
						},
					},
				],
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
			},
		});

		if (existingRoom) {
			// 정확히 2명인지 확인
			if (existingRoom.members.length === 2) {
				return existingRoom;
			}
		}

		// 새 채팅방 생성
		return this.create({
			memberIds: [userId1, userId2],
		});
	},

	/**
	 * 마켓 거래용 채팅방 조회 또는 생성
	 * 구매자가 특정 마켓에 대해 판매자와 채팅할 때 사용
	 */
	async findOrCreateForMarket(
		buyerId: string,
		sellerId: string,
		marketId: string,
	) {
		// 해당 마켓에 대한 구매자-판매자 채팅방 찾기
		const existingRoom = await prisma.chatRoom.findFirst({
			where: {
				marketId,
				AND: [
					{ members: { some: { userId: buyerId } } },
					{ members: { some: { userId: sellerId } } },
				],
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				market: {
					select: {
						id: true,
						title: true,
						price: true,
						status: true,
						userId: true,
						images: {
							take: 1,
							select: { imageUrl: true },
						},
					},
				},
			},
		});

		if (existingRoom) {
			return existingRoom;
		}

		// 새 채팅방 생성
		return this.create({
			memberIds: [buyerId, sellerId],
			marketId,
		});
	},

	/**
	 * 특정 마켓의 채팅방 목록 조회 (판매자용)
	 */
	async findByMarketId(marketId: string) {
		return prisma.chatRoom.findMany({
			where: { marketId },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				market: {
					select: {
						id: true,
						title: true,
						price: true,
						status: true,
						userId: true,
						images: {
							take: 1,
							select: { imageUrl: true },
						},
					},
				},
				messages: {
					take: 1,
					orderBy: { createdAt: "desc" },
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
							},
						},
					},
				},
				_count: {
					select: {
						messages: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	},

	/**
	 * ChatRoom 삭제
	 */
	async delete(id: string) {
		await prisma.chatRoom.delete({
			where: { id },
		});
	},

	/**
	 * 사용자가 채팅방 멤버인지 확인
	 */
	async isMember(roomId: string, userId: string) {
		const member = await prisma.chatRoomMember.findUnique({
			where: {
				roomId_userId: {
					roomId,
					userId,
				},
			},
		});
		return !!member;
	},

	/**
	 * ChatRoom 이름 수정
	 */
	async updateName(id: string, name: string) {
		return prisma.chatRoom.update({
			where: { id },
			data: { name },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
			},
		});
	},
};

/**
 * ChatRoomMember Service
 */
export const chatRoomMemberService = {
	/**
	 * 멤버 추가
	 */
	async addMember(roomId: string, userId: string) {
		return prisma.chatRoomMember.create({
			data: {
				roomId,
				userId,
			},
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 멤버 제거
	 */
	async removeMember(roomId: string, userId: string) {
		await prisma.chatRoomMember.delete({
			where: {
				roomId_userId: {
					roomId,
					userId,
				},
			},
		});
	},

	/**
	 * 채팅방 멤버 목록 조회
	 */
	async findByRoomId(roomId: string) {
		return prisma.chatRoomMember.findMany({
			where: { roomId },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
			orderBy: { joinedAt: "asc" },
		});
	},
};

/**
 * ChatMessage Service
 */
export const chatMessageService = {
	/**
	 * 메시지 목록 조회 (커서 기반 페이지네이션)
	 */
	async findByRoomId(roomId: string, options: ChatPaginationOptions = {}) {
		const { cursor, limit = 50 } = options;

		const messages = await prisma.chatMessage.findMany({
			where: { roomId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});

		const hasMore = messages.length > limit;
		const items = hasMore ? messages.slice(0, -1) : messages;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items: items.reverse(), // 오래된 메시지가 먼저 오도록
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 메시지 생성
	 */
	async create(dto: CreateChatMessageDto) {
		return prisma.chatMessage.create({
			data: {
				content: dto.content,
				roomId: dto.roomId,
				userId: dto.userId,
			},
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 메시지 삭제
	 */
	async delete(id: string) {
		await prisma.chatMessage.delete({
			where: { id },
		});
	},

	/**
	 * 메시지 조회
	 */
	async findById(id: string) {
		return prisma.chatMessage.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 메시지 소유자 확인
	 */
	async isOwner(messageId: string, userId: string) {
		const message = await prisma.chatMessage.findUnique({
			where: { id: messageId },
			select: { userId: true },
		});
		return message?.userId === userId;
	},
};
