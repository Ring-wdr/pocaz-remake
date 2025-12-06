"use client";

import * as stylex from "@stylexjs/stylex";
import {
	ArrowLeft,
	CheckCircle2,
	Copy,
	Paperclip,
	Phone,
	Send,
} from "lucide-react";
import Link from "next/link";
import { useReducer, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { Button, Input } from "@/components/ui";
import { normalizeEdenError } from "@/lib/elysia/client/error";
import { api } from "@/utils/eden";

interface InquiryPageClientProps {
	defaultEmail?: string;
}

type AttachmentFile = {
	file: File;
	preview: string;
};

type SubmissionResult = {
	id: string;
	status: string;
	createdAt?: string;
};

type FormState = {
	category: string;
	title: string;
	content: string;
	contactEmail: string;
	contactPhone: string;
	attachments: AttachmentFile[];
};

type FormAction =
	| {
			type: "setField";
			field: keyof Omit<FormState, "attachments">;
			value: string;
	  }
	| { type: "addAttachments"; attachments: AttachmentFile[] }
	| { type: "removeAttachment"; index: number }
	| { type: "reset" };

const createInitialFormState = (defaultEmail?: string): FormState => ({
	category: "",
	title: "",
	content: "",
	contactEmail: defaultEmail ?? "",
	contactPhone: "",
	attachments: [],
});

const formReducer = (state: FormState, action: FormAction): FormState => {
	switch (action.type) {
		case "setField": {
			return { ...state, [action.field]: action.value };
		}
		case "addAttachments": {
			return {
				...state,
				attachments: [...state.attachments, ...action.attachments],
			};
		}
		case "removeAttachment": {
			return {
				...state,
				attachments: state.attachments.filter((_, i) => i !== action.index),
			};
		}
		case "reset": {
			return { ...createInitialFormState(state.contactEmail) };
		}
		default:
			return state;
	}
};

type UseInquiryFormResult = {
	formState: FormState;
	attachments: AttachmentFile[];
	dispatch: React.Dispatch<FormAction>;
	isEmailValid: boolean;
	isValid: boolean;
};

function useInquiryForm(defaultEmail?: string): UseInquiryFormResult {
	const [formState, dispatch] = useReducer(formReducer, defaultEmail, (email) =>
		createInitialFormState(email),
	);

	const { category, title, content, contactEmail, attachments } = formState;

	const isEmailValid =
		contactEmail.trim().length > 0 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());

	const isValid =
		!!category && !!title.trim() && content.trim().length >= 10 && isEmailValid;

	return {
		formState,
		attachments,
		dispatch,
		isEmailValid,
		isValid,
	};
}

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
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
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
	sublabel: {
		fontSize: fontSize.xs,
		color: colors.textMuted,
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
	attachmentBox: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
		padding: spacing.sm,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		backgroundColor: colors.bgSecondary,
	},
	attachmentHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xs,
	},
	attachmentActions: {
		display: "flex",
		gap: spacing.xs,
		flexWrap: "wrap",
	},
	attachmentButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		backgroundColor: colors.bgPrimary,
		color: colors.textSecondary,
		cursor: "pointer",
		fontSize: fontSize.sm,
	},
	attachmentList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	attachmentItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		padding: spacing.xs,
		borderRadius: radius.sm,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	attachmentPreview: {
		width: 44,
		height: 44,
		objectFit: "cover",
		borderRadius: radius.xs,
		backgroundColor: colors.bgSecondary,
	},
	attachmentMeta: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: 2,
	},
	attachmentName: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		margin: 0,
	},
	attachmentHint: {
		fontSize: fontSize.xs,
		color: colors.textMuted,
		margin: 0,
	},
	removeButton: {
		borderWidth: 0,
		borderStyle: "solid",
		backgroundColor: "transparent",
		color: colors.textMuted,
		cursor: "pointer",
		fontSize: fontSize.sm,
	},
	notice: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	noticeTitle: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	noticeContent: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		lineHeight: 1.6,
		margin: 0,
		whiteSpace: "pre-line",
	},
	helperLinks: {
		display: "flex",
		gap: spacing.sm,
		flexWrap: "wrap",
		marginTop: spacing.xs,
	},
	helperLink: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		textDecoration: "none",
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.sm,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	resultCard: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		backgroundColor: colors.bgSecondary,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	resultHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	resultTitle: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	resultList: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
		gap: spacing.sm,
	},
	resultItem: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	resultLabel: {
		fontSize: fontSize.xs,
		color: colors.textMuted,
		margin: 0,
	},
	resultValue: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		margin: 0,
		wordBreak: "break-all",
	},
	statusBadge: {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: radius.md,
		backgroundColor: colors.bgPrimary,
		color: colors.textSecondary,
		fontSize: fontSize.xs,
	},
	copyButton: {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		backgroundColor: colors.bgPrimary,
		color: colors.textSecondary,
		cursor: "pointer",
		fontSize: fontSize.xs,
	},
	sectionTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
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

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE_MB = 20;

export default function InquiryPageClient({
	defaultEmail,
}: InquiryPageClientProps) {
	const { formState, attachments, dispatch, isEmailValid, isValid } =
		useInquiryForm(defaultEmail);
	const [lastSubmission, setLastSubmission] = useState<SubmissionResult | null>(
		null,
	);
	const [isSubmitting, startSubmit] = useTransition();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { category, title, content, contactEmail, contactPhone } = formState;

	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (!files.length) return;

		const availableSlots = MAX_ATTACHMENTS - attachments.length;
		const selected = files.slice(0, availableSlots);

		const validFiles = selected.filter((file) => {
			const tooLarge = file.size / (1024 * 1024) > MAX_FILE_SIZE_MB;
			if (tooLarge) {
				toast.error(
					`첨부 파일은 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드할 수 있어요.`,
				);
				return false;
			}
			if (!file.type.startsWith("image/")) {
				toast.error("이미지 파일만 업로드할 수 있어요.");
				return false;
			}
			return true;
		});

		const mapped = validFiles.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));

		dispatch({ type: "addAttachments", attachments: mapped });

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeAttachment = (index: number) => {
		const target = attachments[index];
		if (target) {
			URL.revokeObjectURL(target.preview);
		}
		dispatch({ type: "removeAttachment", index });
	};

	const uploadAttachments = async () => {
		if (attachments.length === 0) return [];

		const { data, error } = await api.storage.upload.files.post({
			bucket: "images",
			files: attachments.map((item) => item.file),
		});

		if (error || !data || !("uploaded" in data) || !data.uploaded) {
			const normalizedError = normalizeEdenError(error);
			console.error("Failed to upload attachments:", normalizedError.message);
			return null;
		}

		const failedCount = Array.isArray(data.errors) ? data.errors.length : 0;
		if (failedCount > 0) {
			toast.error("일부 첨부 파일 업로드에 실패했어요. 다시 시도해 주세요.");
			return null;
		}

		return data.uploaded
			.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
			.map((item) => item.publicUrl);
	};

	const buildContentWithMeta = (attachmentUrls: string[]) => {
		const lines = [
			`연락 이메일: ${contactEmail.trim()}`,
			`연락처(선택): ${contactPhone.trim() || "미입력"}`,
		];

		if (attachmentUrls.length > 0) {
			lines.push(`첨부: ${attachmentUrls.join(", ")}`);
		} else {
			lines.push("첨부: 없음");
		}

		return `${content.trim()}\n\n---\n${lines.join("\n")}`;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;

		startSubmit(async () => {
			const uploadedUrls = await uploadAttachments();
			if (uploadedUrls === null) {
				toast.error("첨부 업로드에 실패했습니다. 다시 시도해 주세요.");
				return;
			}

			const payloadContent = buildContentWithMeta(uploadedUrls);
			const { data, error } = await api.support.inquiries.post({
				category,
				title: title.trim(),
				content: payloadContent,
			});

			if (error || !data) {
				console.error("Failed to submit inquiry:", error);
				toast.error("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
				return;
			}

			toast.success(`문의가 접수되었습니다. 접수 번호: ${data.id}`);
			attachments.forEach((item) => {
				URL.revokeObjectURL(item.preview);
			});
			dispatch({ type: "reset" });
			setLastSubmission({
				id: data.id,
				status: data.status,
				createdAt: data.createdAt,
			});
		});
	};

	const handleCopy = async (value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success("복사되었습니다.");
		} catch (err) {
			console.error("Copy failed", err);
			toast.error("복사에 실패했습니다. 다시 시도해 주세요.");
		}
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
							onChange={(e) =>
								dispatch({
									type: "setField",
									field: "category",
									value: e.target.value,
								})
							}
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

					<Input
						label="제목"
						value={title}
						onChange={(e) =>
							dispatch({
								type: "setField",
								field: "title",
								value: e.target.value,
							})
						}
						placeholder="제목을 입력해 주세요"
						maxLength={100}
						disabled={isSubmitting}
					/>

					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="content" {...stylex.props(styles.label)}>
							문의 내용
						</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) =>
								dispatch({
									type: "setField",
									field: "content",
									value: e.target.value,
								})
							}
							placeholder="문의 내용을 상세히 작성해 주세요 (최소 10자)"
							maxLength={2000}
							disabled={isSubmitting}
							{...stylex.props(styles.textarea)}
						/>
						<span {...stylex.props(styles.charCount)}>
							{content.length}/2000
						</span>
					</div>

					<Input
						label="회신 받을 이메일"
						type="email"
						value={contactEmail}
						onChange={(e) =>
							dispatch({
								type: "setField",
								field: "contactEmail",
								value: e.target.value,
							})
						}
						placeholder="답변을 받을 이메일을 입력해 주세요"
						disabled={isSubmitting}
						error={!!contactEmail && !isEmailValid ? "유효한 이메일을 입력해 주세요" : undefined}
						helperText="로그인 계정과 다른 주소도 사용 가능합니다."
					/>

					<Input
						label="추가 연락처 (선택)"
						type="tel"
						value={contactPhone}
						onChange={(e) =>
							dispatch({
								type: "setField",
								field: "contactPhone",
								value: e.target.value,
							})
						}
						placeholder="전화번호 또는 메신저 ID를 남겨주세요"
						disabled={isSubmitting}
						helperText="필요 시 빠른 확인을 위해 사용됩니다."
					/>

					<div {...stylex.props(styles.attachmentBox)}>
						<div {...stylex.props(styles.attachmentHeader)}>
							<div {...stylex.props(styles.attachmentActions)}>
								<label
									htmlFor="attachments"
									{...stylex.props(styles.attachmentButton)}
								>
									<Paperclip size={16} />
									첨부 추가
								</label>
								<input
									id="attachments"
									ref={fileInputRef}
									type="file"
									accept="image/*"
									multiple
									onChange={handleFilesChange}
									disabled={
										isSubmitting || attachments.length >= MAX_ATTACHMENTS
									}
									hidden
								/>
								<span {...stylex.props(styles.sublabel)}>
									이미지 최대 {MAX_ATTACHMENTS}개, 파일당 {MAX_FILE_SIZE_MB}MB
								</span>
							</div>
						</div>

						{attachments.length > 0 ? (
							<div {...stylex.props(styles.attachmentList)}>
								{attachments.map((item, index) => (
									<div
										key={item.preview}
										{...stylex.props(styles.attachmentItem)}
									>
										<img
											src={item.preview}
											alt="첨부 미리보기"
											{...stylex.props(styles.attachmentPreview)}
										/>
										<div {...stylex.props(styles.attachmentMeta)}>
											<p {...stylex.props(styles.attachmentName)}>
												{item.file.name}
											</p>
											<p {...stylex.props(styles.attachmentHint)}>
												{Math.round(item.file.size / 1024)} KB
											</p>
										</div>
										<button
											type="button"
											onClick={() => removeAttachment(index)}
											{...stylex.props(styles.removeButton)}
											aria-label="첨부 삭제"
										>
											삭제
										</button>
									</div>
								))}
							</div>
						) : (
							<p {...stylex.props(styles.attachmentHint)}>
								오류 화면이나 증빙 자료가 있으면 첨부해 주세요.
							</p>
						)}
					</div>

					<Button
						type="submit"
						disabled={!isValid || isSubmitting}
						fullWidth
					>
						<Send size={18} />
						{isSubmitting ? "문의 접수 중..." : "문의하기"}
					</Button>
				</form>

				{lastSubmission && (
					<section aria-live="polite" {...stylex.props(styles.resultCard)}>
						<div {...stylex.props(styles.resultHeader)}>
							<CheckCircle2 size={18} color={colors.statusSuccess} />
							<h2 {...stylex.props(styles.resultTitle)}>접수 완료</h2>
						</div>
						<div {...stylex.props(styles.resultList)}>
							<div {...stylex.props(styles.resultItem)}>
								<p {...stylex.props(styles.resultLabel)}>접수 번호</p>
								<div {...stylex.props(styles.attachmentActions)}>
									<p {...stylex.props(styles.resultValue)}>
										{lastSubmission.id}
									</p>
									<button
										type="button"
										onClick={() => handleCopy(lastSubmission.id)}
										{...stylex.props(styles.copyButton)}
									>
										<Copy size={14} />
										복사
									</button>
								</div>
							</div>
							<div {...stylex.props(styles.resultItem)}>
								<p {...stylex.props(styles.resultLabel)}>처리 상태</p>
								<span {...stylex.props(styles.statusBadge)}>
									<Phone size={14} />
									{lastSubmission.status === "pending" ? "접수됨" : "처리 완료"}
								</span>
							</div>
							{lastSubmission.createdAt && (
								<div {...stylex.props(styles.resultItem)}>
									<p {...stylex.props(styles.resultLabel)}>접수 시각</p>
									<p {...stylex.props(styles.resultValue)}>
										{new Date(lastSubmission.createdAt).toLocaleString("ko-KR")}
									</p>
								</div>
							)}
						</div>
						<p {...stylex.props(styles.noticeContent)}>
							접수 번호를 기준으로 문의를 추적합니다. 추가 자료가 있으면 동일
							번호로 다시 보내 주세요.
						</p>
					</section>
				)}

				<div {...stylex.props(styles.notice)}>
					<h2 {...stylex.props(styles.sectionTitle)}>문의 안내</h2>
					<p {...stylex.props(styles.noticeContent)}>
						- 문의는 평일 기준 1-2일 내 답변됩니다.
						{"\n"}- 주말 및 공휴일에는 답변이 지연될 수 있습니다.
						{"\n"}- 긴급한 문의는 이메일(akswnd55@gmail.com)로 연락해 주세요.
					</p>
					<div {...stylex.props(styles.helperLinks)}>
						<Link href="/support/faq" {...stylex.props(styles.helperLink)}>
							자주 묻는 질문 보기
						</Link>
						<a
							href="mailto:akswnd55@gmail.com?subject=POCAZ%20문의"
							{...stylex.props(styles.helperLink)}
						>
							메일로 문의하기
						</a>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
