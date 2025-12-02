"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { api } from "@/utils/eden";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	formGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	select: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		appearance: "none",
		backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
		backgroundRepeat: "no-repeat",
		backgroundPosition: "right 12px center",
	},
	input: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		outline: "none",
	},
	textarea: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		outline: "none",
		resize: "vertical",
		minHeight: "150px",
		fontFamily: "inherit",
	},
	charCount: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textAlign: "right",
	},
	submitButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: radius.md,
		cursor: "pointer",
		marginTop: spacing.sm,
	},
	submitButtonDisabled: {
		backgroundColor: colors.textPlaceholder,
		cursor: "not-allowed",
	},
	notice: {
		marginTop: spacing.md,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
	},
	noticeTitle: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	noticeContent: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		lineHeight: 1.6,
		margin: 0,
	},
});

const categories = [
	{ value: "", label: "문의 유형을 선택해 주세요" },
	{ value: "account", label: "계정 관련" },
	{ value: "trading", label: "거래 관련" },
	{ value: "report", label: "신고/제보" },
	{ value: "bug", label: "오류/버그" },
	{ value: "suggestion", label: "건의/제안" },
	{ value: "other", label: "기타" },
];

export default function InquiryPage() {
	const [category, setCategory] = useState("");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, startSubmit] = useTransition();

	const isValid = category && title.trim() && content.trim().length >= 10;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;

		startSubmit(async () => {
			const { error } = await api.support.inquiries.post({
				category,
				title: title.trim(),
				content: content.trim(),
			});

			if (error) {
				toast.error("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
				return;
			}

			toast.success("문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
			setTitle("");
			setContent("");
			setCategory("");
		});
	};

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>1:1 문의</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="category" {...stylex.props(styles.label)}>
							문의 유형
						</label>
						<select
							id="category"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						disabled={isSubmitting}
						{...stylex.props(styles.select)}
					>
							{categories.map((cat) => (
								<option key={cat.value} value={cat.value}>
									{cat.label}
								</option>
							))}
						</select>
					</div>

					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="title" {...stylex.props(styles.label)}>
							제목
						</label>
						<input
							id="title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="제목을 입력해 주세요"
							maxLength={100}
						disabled={isSubmitting}
						{...stylex.props(styles.input)}
					/>
					</div>

					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="content" {...stylex.props(styles.label)}>
							문의 내용
						</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="문의 내용을 상세히 작성해 주세요 (최소 10자)"
							maxLength={2000}
						disabled={isSubmitting}
						{...stylex.props(styles.textarea)}
					/>
						<span {...stylex.props(styles.charCount)}>
							{content.length}/2000
						</span>
					</div>

					<button
						type="submit"
						disabled={!isValid || isSubmitting}
						{...stylex.props(
							styles.submitButton,
							(!isValid || isSubmitting) && styles.submitButtonDisabled,
						)}
					>
						<Send size={18} />
						{isSubmitting ? "문의 중..." : "문의하기"}
					</button>
				</form>

				<div {...stylex.props(styles.notice)}>
					<h3 {...stylex.props(styles.noticeTitle)}>문의 안내</h3>
					<p {...stylex.props(styles.noticeContent)}>
						- 문의는 평일 기준 1-2일 내 답변됩니다.
						{"\n"}- 주말 및 공휴일에는 답변이 지연될 수 있습니다.
						{"\n"}- 긴급한 문의는 이메일(akswnd55@gmail.com)로 연락해 주세요.
					</p>
				</div>
			</div>

			<Footer />
		</div>
	);
}
