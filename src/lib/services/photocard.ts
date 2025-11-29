import { prisma } from "@/lib/prisma";

/**
 * Photocard 생성 DTO
 */
export interface CreatePhotocardDto {
	name: string;
	description?: string;
	imageUrl?: string;
	artistId?: string;
}

/**
 * GalmangPoca 생성 DTO
 */
export interface CreateGalmangPocaDto {
	photocardId: string;
	quantity?: number;
}

/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
	cursor?: string;
	limit?: number;
}

/**
 * Photocard Service
 */
export const photocardService = {
	/**
	 * 모든 Photocard 조회
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const photocards = await prisma.photocard.findMany({
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				artist: {
					include: {
						group: true,
					},
				},
			},
		});

		const hasMore = photocards.length > limit;
		const items = hasMore ? photocards.slice(0, -1) : photocards;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * Artist별 Photocard 조회
	 */
	async findByArtistId(artistId: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const photocards = await prisma.photocard.findMany({
			where: { artistId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				artist: {
					include: {
						group: true,
					},
				},
			},
		});

		const hasMore = photocards.length > limit;
		const items = hasMore ? photocards.slice(0, -1) : photocards;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * Photocard 상세 조회
	 */
	async findById(id: string) {
		return prisma.photocard.findUnique({
			where: { id },
			include: {
				artist: {
					include: {
						group: {
							include: {
								agency: true,
							},
						},
					},
				},
			},
		});
	},

	/**
	 * Photocard 생성
	 */
	async create(dto: CreatePhotocardDto) {
		return prisma.photocard.create({
			data: {
				name: dto.name,
				description: dto.description,
				imageUrl: dto.imageUrl,
				artistId: dto.artistId,
			},
			include: {
				artist: true,
			},
		});
	},

	/**
	 * Photocard 수정
	 */
	async update(id: string, dto: Partial<CreatePhotocardDto>) {
		return prisma.photocard.update({
			where: { id },
			data: {
				name: dto.name,
				description: dto.description,
				imageUrl: dto.imageUrl,
				artistId: dto.artistId,
			},
			include: {
				artist: true,
			},
		});
	},

	/**
	 * Photocard 삭제
	 */
	async delete(id: string) {
		await prisma.photocard.delete({
			where: { id },
		});
	},

	/**
	 * 검색
	 */
	async search(keyword: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const photocards = await prisma.photocard.findMany({
			where: {
				OR: [
					{ name: { contains: keyword, mode: "insensitive" } },
					{ description: { contains: keyword, mode: "insensitive" } },
					{ artist: { name: { contains: keyword, mode: "insensitive" } } },
				],
			},
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				artist: {
					include: {
						group: true,
					},
				},
			},
		});

		const hasMore = photocards.length > limit;
		const items = hasMore ? photocards.slice(0, -1) : photocards;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},
};

/**
 * GalmangPoca Service (갈망포카 - 원하는 포토카드)
 */
export const galmangPocaService = {
	/**
	 * 모든 GalmangPoca 조회
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const galmangPocas = await prisma.galmangPoca.findMany({
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				photocard: {
					include: {
						artist: {
							include: {
								group: true,
							},
						},
					},
				},
			},
		});

		const hasMore = galmangPocas.length > limit;
		const items = hasMore ? galmangPocas.slice(0, -1) : galmangPocas;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * GalmangPoca 상세 조회
	 */
	async findById(id: string) {
		return prisma.galmangPoca.findUnique({
			where: { id },
			include: {
				photocard: {
					include: {
						artist: {
							include: {
								group: true,
							},
						},
					},
				},
			},
		});
	},

	/**
	 * GalmangPoca 생성
	 */
	async create(dto: CreateGalmangPocaDto) {
		return prisma.galmangPoca.create({
			data: {
				photocardId: dto.photocardId,
				quantity: dto.quantity ?? 1,
			},
			include: {
				photocard: {
					include: {
						artist: true,
					},
				},
			},
		});
	},

	/**
	 * GalmangPoca 수량 수정
	 */
	async updateQuantity(id: string, quantity: number) {
		return prisma.galmangPoca.update({
			where: { id },
			data: { quantity },
			include: {
				photocard: true,
			},
		});
	},

	/**
	 * GalmangPoca 삭제
	 */
	async delete(id: string) {
		await prisma.galmangPoca.delete({
			where: { id },
		});
	},

	/**
	 * Photocard별 GalmangPoca 조회
	 */
	async findByPhotocardId(photocardId: string) {
		return prisma.galmangPoca.findMany({
			where: { photocardId },
			include: {
				photocard: true,
			},
		});
	},
};
