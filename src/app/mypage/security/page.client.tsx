"use client";

import * as stylex from "@stylexjs/stylex";
import {
	AlertTriangle,
	ArrowLeft,
	Loader2,
	LogOut,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { signOut } from "@/lib/auth/actions";
import { api } from "@/utils/eden";

interface SecurityPageClientProps {
	loginProvider: string;
	loginEmail: string;
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
	},
	section: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		fontSize: "13px",
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xs,
		paddingLeft: spacing.xxxs,
	},
	infoCard: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	infoRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
	},
	infoLabel: {
		fontSize: fontSize.md,
		color: colors.textMuted,
		margin: 0,
	},
	infoValue: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
	},
	list: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		cursor: "pointer",
		textAlign: "left",
	},
	itemLast: {
		borderBottomWidth: 0,
	},
	icon: {
		color: colors.textMuted,
	},
	iconDanger: {
		color: colors.statusError,
	},
	label: {
		flex: 1,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
	},
	labelDanger: {
		color: colors.statusError,
	},
	actionDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
	warningBox: {
		display: "flex",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.statusWarningBg,
		borderRadius: radius.md,
		marginTop: spacing.md,
	},
	warningIcon: {
		color: colors.statusWarning,
		flexShrink: 0,
	},
	warningText: {
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		lineHeight: 1.5,
		margin: 0,
	},
	modal: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 1000,
	},
	modalContent: {
		width: "90%",
		maxWidth: "320px",
		backgroundColor: colors.bgPrimary,
		borderRadius: radius.lg,
		overflow: "hidden",
	},
	modalHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.md,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
	},
	modalTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	modalBody: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.md,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
	},
	modalText: {
		fontSize: fontSize.md,
		color: colors.textMuted,
		textAlign: "center",
		lineHeight: 1.5,
		margin: 0,
	},
	modalTextStrong: {
		color: colors.statusError,
		fontWeight: fontWeight.semibold,
	},
	modalActions: {
		display: "flex",
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	modalButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		flex: 1,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
	},
	modalButtonCancel: {
		color: colors.textMuted,
		borderRightWidth: 1,
		borderRightStyle: "solid",
		borderRightColor: colors.borderPrimary,
	},
	modalButtonDanger: {
		color: colors.statusError,
	},
	modalButtonPrimary: {
		color: colors.accentPrimary,
	},
});

type ModalType = "logout" | "delete" | null;

export default function SecurityPageClient({
	loginProvider,
	loginEmail,
}: SecurityPageClientProps) {
	const [activeModal, setActiveModal] = useState<ModalType>(null);
	const [isLoggingOut, startLogout] = useTransition();
	const [isDeleting, startDelete] = useTransition();

	const handleLogout = () => {
		startLogout(async () => {
			try {
				toast.loading("로그아웃 중...", { id: "logout" });
				await signOut();
				toast.success("로그아웃되었습니다.", { id: "logout" });
			} catch (error) {
				console.error(error);
				toast.error("로그아웃에 실패했습니다. 다시 시도해 주세요.", {
					id: "logout",
				});
			} finally {
				setActiveModal(null);
			}
		});
	};

	const handleDeleteAccount = () => {
		startDelete(async () => {
			try {
				toast.loading("회원 탈퇴 처리 중...", { id: "delete" });
				const result = await api.users.me.delete();
				let errorMessage = "";
				if (result.response.status === 404) {
					const { value } = result.error || {};
					if (value) {
						if (value && "error" in value) {
							errorMessage = value.error;
						} else if (value.message) {
							errorMessage = value.message;
						}
					}
				}

				if (errorMessage) {
					throw new Error(errorMessage);
				}

				toast.success("회원 탈퇴가 완료되었습니다.", { id: "delete" });
				await signOut();
			} catch (error) {
				console.error(error);
				if (error instanceof Error) {
					toast.error(error.message, { id: "delete" });
				} else {
					toast.error("회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.", {
						id: "delete",
					});
				}
			} finally {
				setActiveModal(null);
			}
		});
	};

	const isProcessing = isLoggingOut || isDeleting;

	return (
		<div {...stylex.props(styles.container)}>
			<style>
				{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
			</style>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage/settings" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>보안</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>로그인 정보</h2>
					<div {...stylex.props(styles.infoCard)}>
						<div {...stylex.props(styles.infoRow)}>
							<p {...stylex.props(styles.infoLabel)}>로그인 방식</p>
							<p {...stylex.props(styles.infoValue)}>{loginProvider}</p>
						</div>
						<div {...stylex.props(styles.infoRow)}>
							<p {...stylex.props(styles.infoLabel)}>연결된 계정</p>
							<p {...stylex.props(styles.infoValue)}>{loginEmail}</p>
						</div>
					</div>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>계정 관리</h2>
					<div {...stylex.props(styles.list)}>
						<button
							type="button"
							onClick={() => setActiveModal("logout")}
							disabled={isProcessing}
							{...stylex.props(
								styles.item,
								isProcessing && styles.actionDisabled,
							)}
						>
							{isLoggingOut ? (
								<Loader2
									size={20}
									style={{ animation: "spin 1s linear infinite" }}
									{...stylex.props(styles.icon)}
								/>
							) : (
								<LogOut size={20} {...stylex.props(styles.icon)} />
							)}
							<span {...stylex.props(styles.label)}>
								{isLoggingOut ? "로그아웃 중..." : "로그아웃"}
							</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveModal("delete")}
							disabled={isProcessing}
							{...stylex.props(
								styles.item,
								styles.itemLast,
								isProcessing && styles.actionDisabled,
							)}
						>
							{isDeleting ? (
								<Loader2
									size={20}
									style={{ animation: "spin 1s linear infinite" }}
									{...stylex.props(styles.iconDanger)}
								/>
							) : (
								<Trash2 size={20} {...stylex.props(styles.iconDanger)} />
							)}
							<span {...stylex.props(styles.label, styles.labelDanger)}>
								{isDeleting ? "처리 중..." : "회원 탈퇴"}
							</span>
						</button>
					</div>
				</div>

				<div {...stylex.props(styles.warningBox)}>
					<AlertTriangle size={20} {...stylex.props(styles.warningIcon)} />
					<p {...stylex.props(styles.warningText)}>
						회원 탈퇴 시 모든 데이터(게시글, 댓글, 거래 내역 등)가 영구적으로
						삭제되며 복구할 수 없습니다.
					</p>
				</div>
			</div>

			{activeModal === "logout" && (
				<div {...stylex.props(styles.modal)}>
					<div {...stylex.props(styles.modalContent)}>
						<div {...stylex.props(styles.modalHeader)}>
							<LogOut size={20} />
							<h3 {...stylex.props(styles.modalTitle)}>로그아웃</h3>
						</div>
						<div {...stylex.props(styles.modalBody)}>
							<p {...stylex.props(styles.modalText)}>
								정말로 로그아웃하시겠습니까?
							</p>
						</div>
						<div {...stylex.props(styles.modalActions)}>
							<button
								type="button"
								onClick={() => setActiveModal(null)}
								disabled={isLoggingOut}
								{...stylex.props(
									styles.modalButton,
									styles.modalButtonCancel,
									isLoggingOut && styles.actionDisabled,
								)}
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleLogout}
								disabled={isLoggingOut}
								{...stylex.props(
									styles.modalButton,
									styles.modalButtonPrimary,
									isLoggingOut && styles.actionDisabled,
								)}
							>
								{isLoggingOut && (
									<Loader2
										size={16}
										style={{ animation: "spin 1s linear infinite" }}
									/>
								)}
								{isLoggingOut ? "로그아웃 중..." : "로그아웃"}
							</button>
						</div>
					</div>
				</div>
			)}

			{activeModal === "delete" && (
				<div {...stylex.props(styles.modal)}>
					<div {...stylex.props(styles.modalContent)}>
						<div {...stylex.props(styles.modalHeader)}>
							<AlertTriangle size={20} color={colors.statusError} />
							<h3 {...stylex.props(styles.modalTitle)}>회원 탈퇴</h3>
						</div>
						<div {...stylex.props(styles.modalBody)}>
							<p {...stylex.props(styles.modalText)}>
								정말로 탈퇴하시겠습니까?
								<br />
								<br />
								<span {...stylex.props(styles.modalTextStrong)}>
									모든 데이터가 삭제되며 복구할 수 없습니다.
								</span>
							</p>
						</div>
						<div {...stylex.props(styles.modalActions)}>
							<button
								type="button"
								onClick={() => setActiveModal(null)}
								disabled={isDeleting}
								{...stylex.props(
									styles.modalButton,
									styles.modalButtonCancel,
									isDeleting && styles.actionDisabled,
								)}
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleDeleteAccount}
								disabled={isDeleting}
								{...stylex.props(
									styles.modalButton,
									styles.modalButtonDanger,
									isDeleting && styles.actionDisabled,
								)}
							>
								{isDeleting && (
									<Loader2
										size={16}
										style={{ animation: "spin 1s linear infinite" }}
									/>
								)}
								{isDeleting ? "처리 중..." : "탈퇴하기"}
							</button>
						</div>
					</div>
				</div>
			)}

			<Footer />
		</div>
	);
}
