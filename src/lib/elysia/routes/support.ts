import { Elysia, t } from "elysia";

import { authGuard } from "@/lib/elysia/auth";
import { supportService } from "@/lib/services/support";
import { userService } from "@/lib/services/user";

const InquirySchema = t.Object({
	id: t.String(),
	category: t.String(),
	title: t.String(),
	content: t.String(),
	status: t.String(),
	createdAt: t.String(),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

export const supportRoutes = new Elysia({ prefix: "/support" })
	.use(authGuard)
	// POST /api/support/inquiries - 문의 등록
	.post(
		"/inquiries",
		async ({ auth, body, status }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const inquiry = await supportService.create({
				userId: user.id,
				category: body.category,
				title: body.title,
				content: body.content,
			});

			return status(200, {
				id: inquiry.id,
				category: inquiry.category,
				title: inquiry.title,
				content: inquiry.content,
				status: inquiry.status,
				createdAt: inquiry.createdAt.toISOString(),
			});
		},
		{
			body: t.Object({
				category: t.String({ minLength: 1 }),
				title: t.String({ minLength: 1, maxLength: 120 }),
				content: t.String({ minLength: 10, maxLength: 2000 }),
			}),
			response: {
				200: InquirySchema,
				401: ErrorSchema,
			},
			detail: {
				tags: ["Support"],
				summary: "문의 등록",
				description: "사용자가 문의를 등록합니다.",
			},
		},
	)
	// GET /api/support/inquiries - 내 문의 목록
	.get(
		"/inquiries",
		async ({ auth, query }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const limit = query.limit ? Number.parseInt(query.limit, 10) : 20;
			const inquiries = await supportService.listByUser(user.id, limit);

			return {
				items: inquiries.map((inquiry) => ({
					id: inquiry.id,
					category: inquiry.category,
					title: inquiry.title,
					status: inquiry.status,
					createdAt: inquiry.createdAt.toISOString(),
				})),
			};
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					items: t.Array(
						t.Object({
							id: t.String(),
							category: t.String(),
							title: t.String(),
							status: t.String(),
							createdAt: t.String(),
						}),
					),
				}),
				401: ErrorSchema,
			},
			detail: {
				tags: ["Support"],
				summary: "내 문의 목록",
				description: "현재 사용자가 등록한 문의 목록을 조회합니다.",
			},
		},
	);
