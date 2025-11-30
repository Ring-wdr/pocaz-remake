import { prisma } from "@/lib/prisma";

/**
 * User 생성 DTO
 */
export interface CreateUserDto {
	supabaseId: string;
	email?: string | null;
	nickname?: string;
	profileImage?: string | null;
}

/**
 * User 수정 DTO
 */
export interface UpdateUserDto {
	nickname?: string;
	profileImage?: string | null;
}

/**
 * 랜덤 닉네임 생성
 */
function generateNickname(): string {
	const adjectives = [
		"행복한",
		"즐거운",
		"신나는",
		"귀여운",
		"멋진",
		"빛나는",
		"반짝이는",
		"따뜻한",
		"활기찬",
		"사랑스러운",
	];
	const nouns = [
		"포카",
		"덕후",
		"수집가",
		"팬",
		"최애",
		"포토카드",
		"앨범러버",
		"스타",
		"아이돌러",
		"콜렉터",
	];
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const num = Math.floor(Math.random() * 1000);
	return `${adj}${noun}${num}`;
}

/**
 * User Service
 */
export const userService = {
	/**
	 * Supabase ID로 User 조회
	 */
	async findBySupabaseId(supabaseId: string) {
		return prisma.user.findUnique({
			where: { supabaseId },
		});
	},

	/**
	 * ID로 User 조회
	 */
	async findById(id: string) {
		return prisma.user.findUnique({
			where: { id },
		});
	},

	/**
	 * 모든 User 조회 (soft delete 제외)
	 */
	async findAll() {
		return prisma.user.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: "desc" },
		});
	},

	/**
	 * User 생성
	 */
	async create(dto: CreateUserDto) {
		return prisma.user.create({
			data: {
				supabaseId: dto.supabaseId,
				email: dto.email,
				nickname: dto.nickname ?? generateNickname(),
				profileImage: dto.profileImage,
			},
		});
	},

	/**
	 * User 수정
	 */
	async update(id: string, dto: UpdateUserDto) {
		return prisma.user.update({
			where: { id },
			data: {
				nickname: dto.nickname,
				profileImage: dto.profileImage,
			},
		});
	},

	/**
	 * Soft Delete
	 */
	async softDelete(id: string) {
		return prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	},

	/**
	 * Soft Delete 복구
	 */
	async restore(id: string) {
		return prisma.user.update({
			where: { id },
			data: { deletedAt: null },
		});
	},

	/**
	 * Supabase Auth로 User 조회 또는 생성 (자동 연동)
	 */
	async findOrCreate(supabaseId: string, email?: string | null, name?: string | null, avatarUrl?: string | null) {
		const existingUser = await this.findBySupabaseId(supabaseId);

		if (existingUser) {
			// Soft deleted 사용자인 경우 복구
			if (existingUser.deletedAt) {
				return this.restore(existingUser.id);
			}
			return existingUser;
		}

		// 새 사용자 생성
		return this.create({
			supabaseId,
			email,
			nickname: name ?? undefined,
			profileImage: avatarUrl,
		});
	},

	/**
	 * 점수 업데이트
	 */
	async updateScore(id: string, delta: number) {
		return prisma.user.update({
			where: { id },
			data: {
				score: { increment: delta },
			},
		});
	},
};
