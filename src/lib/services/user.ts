import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * 탈퇴한 계정에 남기는 표시 이름. 다른 사용자는 이 닉네임을 쓸 수 없다.
 */
export const WITHDRAWN_NICKNAME = "탈퇴한 사용자";

/**
 * 닉네임 규칙(앞뒤 공백을 뺀 2~20자)에 맞으면 다듬은 값을, 아니면 null을 돌려준다.
 */
export function normalizeNickname(value: string): string | null {
	const nickname = value.trim();
	return nickname.length >= 2 && nickname.length <= 20 ? nickname : null;
}

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
 * 다른 활성 사용자가 쓰지 않는 닉네임인지 확인한다.
 * DB에 유일 제약이 없어서, 같은 닉네임을 확인하는 트랜잭션끼리는 advisory lock으로 차례를 정한다.
 * 잠금은 트랜잭션이 끝날 때 풀리므로, 확인한 뒤 같은 트랜잭션에서 저장해야 한다.
 */
async function claimNickname(
	tx: Prisma.TransactionClient,
	nickname: string,
	excludeUserId?: string,
) {
	if (nickname === WITHDRAWN_NICKNAME) return false;
	await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${nickname}))`;
	const owner = await tx.user.findFirst({
		where: {
			nickname,
			deletedAt: null,
			...(excludeUserId && { id: { not: excludeUserId } }),
		},
		select: { id: true },
	});
	return !owner;
}

/**
 * 새 계정의 닉네임. 소셜 계정 이름이 규칙에 맞고 비어 있으면 쓰고, 아니면 무작위로 만든다.
 */
async function pickNickname(
	tx: Prisma.TransactionClient,
	preferred?: string | null,
) {
	const candidates = [
		preferred ? normalizeNickname(preferred) : null,
		...Array.from({ length: 5 }, generateNickname),
	];
	for (const candidate of candidates) {
		if (candidate && (await claimNickname(tx, candidate))) return candidate;
	}
	// 무작위 닉네임이 다섯 번 연달아 겹칠 일은 거의 없다. 그래도 가입은 막지 않는다.
	return `포카${randomUUID().slice(0, 8)}`;
}

/**
 * 탈퇴한 계정에서 지우는 값. Supabase ID를 떼어 내서 같은 소셜 계정으로 다시 로그인하면 새 계정이 만들어진다.
 */
function withdrawnFields(id: string) {
	return {
		supabaseId: `withdrawn:${id}`,
		email: null,
		nickname: WITHDRAWN_NICKNAME,
		profileImage: null,
	};
}

/**
 * User Service
 */
export const userService = {
	/**
	 * Supabase ID로 User 조회 (탈퇴한 계정 제외)
	 */
	async findBySupabaseId(supabaseId: string) {
		return prisma.user.findUnique({
			where: { supabaseId, deletedAt: null },
		});
	},

	/**
	 * ID로 User 조회 (탈퇴한 계정 제외)
	 */
	async findById(id: string) {
		return prisma.user.findUnique({
			where: { id, deletedAt: null },
		});
	},

	/**
	 * 주어진 ID가 모두 탈퇴하지 않은 사용자인지
	 */
	async allExist(ids: string[]) {
		const unique = Array.from(new Set(ids));
		const count = await prisma.user.count({
			where: { id: { in: unique }, deletedAt: null },
		});
		return count === unique.length;
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
	 * User 생성. 닉네임이 없거나 이미 쓰이고 있으면 무작위 닉네임으로 만든다.
	 */
	async create(dto: CreateUserDto) {
		return prisma.$transaction(async (tx) =>
			tx.user.create({
				data: {
					supabaseId: dto.supabaseId,
					email: dto.email,
					nickname: await pickNickname(tx, dto.nickname),
					profileImage: dto.profileImage,
				},
			}),
		);
	},

	/**
	 * User 수정. 바꾸려는 닉네임을 다른 사용자가 쓰고 있으면 null
	 */
	async update(id: string, dto: UpdateUserDto) {
		return prisma.$transaction(async (tx) => {
			if (dto.nickname !== undefined) {
				const current = await tx.user.findUniqueOrThrow({
					where: { id },
					select: { nickname: true },
				});
				// 중복 검사 도입 전에 생긴 같은 닉네임은 그대로 둘 수 있게, 바뀔 때만 확인한다
				if (
					dto.nickname !== current.nickname &&
					!(await claimNickname(tx, dto.nickname, id))
				) {
					return null;
				}
			}
			return tx.user.update({
				where: { id },
				data: {
					nickname: dto.nickname,
					profileImage: dto.profileImage,
				},
			});
		});
	},

	/**
	 * 회원 탈퇴. 계정의 개인정보(이메일·닉네임·프로필 사진)를 지우고 Supabase ID를 떼어 낸다.
	 * 다시 로그인하면 새 계정으로 시작하고, 남은 글의 작성자는 "탈퇴한 사용자"로 보인다.
	 */
	async softDelete(id: string) {
		return prisma.user.update({
			where: { id },
			data: { ...withdrawnFields(id), deletedAt: new Date() },
		});
	},

	/**
	 * Supabase Auth로 User 조회 또는 생성 (자동 연동). 탈퇴한 계정은 복구하지 않는다.
	 */
	async findOrCreate(
		supabaseId: string,
		email?: string | null,
		name?: string | null,
		avatarUrl?: string | null,
	) {
		const existingUser = await prisma.user.findUnique({
			where: { supabaseId },
		});
		if (existingUser && !existingUser.deletedAt) {
			return existingUser;
		}
		if (existingUser) {
			// Supabase ID를 떼어 내기 전 방식으로 탈퇴한 계정. 새 계정을 만들 수 있게 지금 떼어 낸다.
			await prisma.user.update({
				where: { id: existingUser.id },
				data: withdrawnFields(existingUser.id),
			});
		}

		try {
			return await this.create({
				supabaseId,
				email,
				nickname: name ?? undefined,
				profileImage: avatarUrl,
			});
		} catch (error) {
			// 같은 사용자의 첫 요청 여러 개가 동시에 오면 하나만 만들어지고 나머지는 유일 제약에 걸린다
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				const created = await this.findBySupabaseId(supabaseId);
				if (created) return created;
			}
			throw error;
		}
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

	/**
	 * 닉네임 중복 검사
	 * @returns true if nickname is available
	 */
	async isNicknameAvailable(nickname: string, excludeUserId?: string) {
		if (nickname === WITHDRAWN_NICKNAME) return false;
		const existingUser = await prisma.user.findFirst({
			where: {
				nickname,
				deletedAt: null,
				...(excludeUserId && { id: { not: excludeUserId } }),
			},
		});
		return !existingUser;
	},
};
