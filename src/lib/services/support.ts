import { prisma } from "@/lib/prisma";

export interface CreateSupportInquiryDto {
	userId: string;
	category: string;
	title: string;
	content: string;
}

export const supportService = {
	async create(dto: CreateSupportInquiryDto) {
		return prisma.supportInquiry.create({
			data: {
				userId: dto.userId,
				category: dto.category,
				title: dto.title,
				content: dto.content,
			},
		});
	},

	async listByUser(userId: string, limit = 20) {
		const inquiries = await prisma.supportInquiry.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		return inquiries;
	},
};
