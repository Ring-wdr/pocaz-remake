import { prisma } from "@/lib/prisma";

/**
 * Agency 생성 DTO
 */
export interface CreateAgencyDto {
	name: string;
}

/**
 * ArtistGroup 생성 DTO
 */
export interface CreateArtistGroupDto {
	name: string;
	agencyId?: string;
}

/**
 * Artist 생성 DTO
 */
export interface CreateArtistDto {
	name: string;
	groupId?: string;
}

/**
 * Agency Service
 */
export const agencyService = {
	/**
	 * 모든 Agency 조회
	 */
	async findAll() {
		return prisma.agency.findMany({
			orderBy: { name: "asc" },
			include: {
				groups: {
					include: {
						artists: true,
					},
				},
			},
		});
	},

	/**
	 * Agency 상세 조회
	 */
	async findById(id: string) {
		return prisma.agency.findUnique({
			where: { id },
			include: {
				groups: {
					include: {
						artists: true,
					},
				},
			},
		});
	},

	/**
	 * Agency 생성
	 */
	async create(dto: CreateAgencyDto) {
		return prisma.agency.create({
			data: {
				name: dto.name,
			},
		});
	},

	/**
	 * Agency 수정
	 */
	async update(id: string, name: string) {
		return prisma.agency.update({
			where: { id },
			data: { name },
		});
	},

	/**
	 * Agency 삭제
	 */
	async delete(id: string): Promise<void> {
		await prisma.agency.delete({
			where: { id },
		});
	},
};

/**
 * ArtistGroup Service
 */
export const artistGroupService = {
	/**
	 * 모든 ArtistGroup 조회
	 */
	async findAll() {
		return prisma.artistGroup.findMany({
			orderBy: { name: "asc" },
			include: {
				agency: true,
				artists: true,
			},
		});
	},

	/**
	 * Agency별 ArtistGroup 조회
	 */
	async findByAgencyId(agencyId: string) {
		return prisma.artistGroup.findMany({
			where: { agencyId },
			orderBy: { name: "asc" },
			include: {
				agency: true,
				artists: true,
			},
		});
	},

	/**
	 * ArtistGroup 상세 조회
	 */
	async findById(id: string) {
		return prisma.artistGroup.findUnique({
			where: { id },
			include: {
				agency: true,
				artists: true,
			},
		});
	},

	/**
	 * ArtistGroup 생성
	 */
	async create(dto: CreateArtistGroupDto) {
		return prisma.artistGroup.create({
			data: {
				name: dto.name,
				agencyId: dto.agencyId,
			},
			include: {
				agency: true,
			},
		});
	},

	/**
	 * ArtistGroup 수정
	 */
	async update(id: string, dto: Partial<CreateArtistGroupDto>) {
		return prisma.artistGroup.update({
			where: { id },
			data: {
				name: dto.name,
				agencyId: dto.agencyId,
			},
			include: {
				agency: true,
			},
		});
	},

	/**
	 * ArtistGroup 삭제
	 */
	async delete(id: string): Promise<void> {
		await prisma.artistGroup.delete({
			where: { id },
		});
	},
};

/**
 * Artist Service
 */
export const artistService = {
	/**
	 * 모든 Artist 조회
	 */
	async findAll() {
		return prisma.artist.findMany({
			orderBy: { name: "asc" },
			include: {
				group: {
					include: {
						agency: true,
					},
				},
			},
		});
	},

	/**
	 * Group별 Artist 조회
	 */
	async findByGroupId(groupId: string) {
		return prisma.artist.findMany({
			where: { groupId },
			orderBy: { name: "asc" },
			include: {
				group: {
					include: {
						agency: true,
					},
				},
			},
		});
	},

	/**
	 * Artist 상세 조회
	 */
	async findById(id: string) {
		return prisma.artist.findUnique({
			where: { id },
			include: {
				group: {
					include: {
						agency: true,
					},
				},
				photocards: true,
			},
		});
	},

	/**
	 * Artist 생성
	 */
	async create(dto: CreateArtistDto) {
		return prisma.artist.create({
			data: {
				name: dto.name,
				groupId: dto.groupId,
			},
			include: {
				group: true,
			},
		});
	},

	/**
	 * Artist 수정
	 */
	async update(id: string, dto: Partial<CreateArtistDto>) {
		return prisma.artist.update({
			where: { id },
			data: {
				name: dto.name,
				groupId: dto.groupId,
			},
			include: {
				group: true,
			},
		});
	},

	/**
	 * Artist 삭제
	 */
	async delete(id: string): Promise<void> {
		await prisma.artist.delete({
			where: { id },
		});
	},

	/**
	 * 검색
	 */
	async search(keyword: string) {
		return prisma.artist.findMany({
			where: {
				OR: [
					{ name: { contains: keyword, mode: "insensitive" } },
					{ group: { name: { contains: keyword, mode: "insensitive" } } },
				],
			},
			orderBy: { name: "asc" },
			include: {
				group: {
					include: {
						agency: true,
					},
				},
			},
		});
	},
};
