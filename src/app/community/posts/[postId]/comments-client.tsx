"use client";

import * as stylex from "@stylexjs/stylex";
import {
	Check,
	ChevronDown,
	CornerDownRight,
	LogIn,
	MessageCircle,
	Pencil,
	Send,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";

const styles = stylex.create({
	section: {
		marginTop: spacing.md,
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
	},
	title: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textPrimary,
		margin: 0,
	},
	commentForm: {
		display: "flex",
		gap: spacing.xs,
		marginBottom: spacing.md,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
	},
	commentInput: {
		flex: 1,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		backgroundColor: colors.bgSecondary,
		color: colors.textPrimary,
		outline: "none",
	},
	submitButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: colors.accentPrimary,
		borderWidth: 0,
		borderRadius: radius.md,
		cursor: "pointer",
		color: "#ffffff",
	},
	submitButtonDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
	},
	commentItem: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	commentHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		marginBottom: spacing.xxxs,
	},
	avatar: {
		width: size.avatarSm,
		height: size.avatarSm,
		borderRadius: radius.full,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	authorName: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textPrimary,
	},
	commentDate: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	commentContent: {
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
		color: colors.textSecondary,
		margin: 0,
		paddingLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
	},
	deletedContent: {
		color: colors.textPlaceholder,
		fontStyle: "italic",
	},
	commentActions: {
		display: "flex",
		gap: spacing.sm,
		paddingLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
		marginTop: spacing.xxxs,
	},
	actionButton: {
		display: "flex",
		alignItems: "center",
		gap: "2px",
		fontSize: fontSize.sm,
		color: colors.textMuted,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		padding: 0,
	},
	repliesSection: {
		marginLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
		marginTop: spacing.xs,
	},
	replyItem: {
		display: "flex",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
	},
	replyIcon: {
		color: colors.textMuted,
		flexShrink: 0,
		marginTop: "2px",
	},
	replyContent: {
		flex: 1,
	},
	replyHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		marginBottom: "2px",
	},
	replyAvatar: {
		width: "24px",
		height: "24px",
		borderRadius: radius.full,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	replyText: {
		fontSize: fontSize.sm,
		lineHeight: lineHeight.normal,
		color: colors.textSecondary,
		margin: 0,
	},
	replyForm: {
		display: "flex",
		gap: spacing.xxs,
		marginTop: spacing.xs,
		marginLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
	},
	replyInput: {
		flex: 1,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		backgroundColor: colors.bgSecondary,
		color: colors.textPrimary,
		outline: "none",
	},
	replySubmitButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: colors.accentPrimary,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		color: "#ffffff",
	},
	loadMoreButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
		fontSize: fontSize.md,
	},
	emptyComments: {
		textAlign: "center",
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
		color: colors.textPlaceholder,
		fontSize: fontSize.md,
	},
	loginPrompt: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		marginBottom: spacing.md,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		fontSize: fontSize.md,
		color: colors.textMuted,
	},
	loginLink: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		color: colors.accentPrimary,
		textDecoration: "none",
		fontWeight: fontWeight.medium,
	},
	editForm: {
		display: "flex",
		gap: spacing.xxs,
		paddingLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
	},
	editInput: {
		flex: 1,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.accentPrimary,
		borderRadius: radius.sm,
		backgroundColor: colors.bgSecondary,
		color: colors.textPrimary,
		outline: "none",
	},
	editButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "28px",
		height: "28px",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	editSaveButton: {
		backgroundColor: colors.accentPrimary,
		color: "#ffffff",
	},
	editCancelButton: {
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
	},
	dangerButton: {
		color: colors.statusError,
	},
	replyActions: {
		display: "flex",
		gap: spacing.xs,
		marginTop: spacing.xxxs,
	},
});

interface User {
	id: string;
	nickname: string;
	profileImage: string | null;
}

interface CommentReply {
	id: string;
	content: string;
	createdAt: string;
	deletedAt: string | null;
	user: User;
}

interface Comment {
	id: string;
	content: string;
	createdAt: string;
	deletedAt: string | null;
	user: User;
	replies: CommentReply[];
	replyCount: number;
}

interface CommentsClientProps {
	postId: string;
	initialData: {
		items: Comment[];
		totalCount: number;
		nextCursor: string | null;
		hasMore: boolean;
	};
	isLoggedIn: boolean;
	currentUserId?: string;
}

export function CommentsClient({
	postId,
	initialData,
	isLoggedIn,
	currentUserId,
}: CommentsClientProps) {
	const [comments, setComments] = useState<Comment[]>(initialData.items);
	const [totalCount, setTotalCount] = useState(initialData.totalCount);
	const [nextCursor, setNextCursor] = useState<string | null>(
		initialData.nextCursor,
	);
	const [hasMore, setHasMore] = useState(initialData.hasMore);
	const [isPending, startTransition] = useTransition();

	const [commentText, setCommentText] = useState("");
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyText, setReplyText] = useState("");

	// 수정 상태
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");

	const fetchComments = async (cursor?: string) => {
		const { data, error } = await api.posts({ id: postId }).comments.get({
			query: { cursor, limit: "20" },
		});

		if (error || !data) {
			toast.error("댓글을 불러오는데 실패했습니다");
			return;
		}

		if (cursor) {
			setComments((prev) => [...prev, ...data.items]);
		} else {
			setComments(data.items);
		}
		setNextCursor(data.nextCursor);
		setHasMore(data.hasMore);
		setTotalCount(data.totalCount);
	};

	const handleSubmitComment = () => {
		if (!commentText.trim() || !currentUserId) return;

		const trimmedContent = commentText.trim();
		const tempId = `temp-${Date.now()}`;

		// 낙관적 업데이트: 임시 댓글 추가
		const tempComment: Comment = {
			id: tempId,
			content: trimmedContent,
			createdAt: new Date().toISOString(),
			deletedAt: null,
			user: {
				id: currentUserId,
				nickname: "나",
				profileImage: null,
			},
			replies: [],
			replyCount: 0,
		};

		setComments((prev) => [tempComment, ...prev]);
		setTotalCount((prev) => prev + 1);
		setCommentText("");

		startTransition(async () => {
			const { data, error } = await api.posts({ id: postId }).comments.post({
				content: trimmedContent,
			});

			if (error || !data) {
				// 롤백: 임시 댓글 제거
				setComments((prev) => prev.filter((c) => c.id !== tempId));
				setTotalCount((prev) => prev - 1);
				toast.error("댓글 작성에 실패했습니다", {
					action: {
						label: "재시도",
						onClick: () => {
							setCommentText(trimmedContent);
						},
					},
				});
				return;
			}

			// 서버 응답으로 교체
			await fetchComments();
		});
	};

	const handleSubmitReply = (parentId: string) => {
		if (!replyText.trim() || !currentUserId) return;

		const trimmedContent = replyText.trim();
		const tempId = `temp-reply-${Date.now()}`;

		// 낙관적 업데이트: 임시 답글 추가
		const tempReply: CommentReply = {
			id: tempId,
			content: trimmedContent,
			createdAt: new Date().toISOString(),
			deletedAt: null,
			user: {
				id: currentUserId,
				nickname: "나",
				profileImage: null,
			},
		};

		setComments((prev) =>
			prev.map((comment) =>
				comment.id === parentId
					? {
							...comment,
							replies: [...comment.replies, tempReply],
							replyCount: comment.replyCount + 1,
						}
					: comment,
			),
		);
		setReplyText("");
		setReplyingTo(null);

		startTransition(async () => {
			const { data, error } = await api.posts({ id: postId }).comments.post({
				content: trimmedContent,
				parentId,
			});

			if (error || !data) {
				// 롤백: 임시 답글 제거
				setComments((prev) =>
					prev.map((comment) =>
						comment.id === parentId
							? {
									...comment,
									replies: comment.replies.filter((r) => r.id !== tempId),
									replyCount: comment.replyCount - 1,
								}
							: comment,
					),
				);
				toast.error("답글 작성에 실패했습니다", {
					action: {
						label: "재시도",
						onClick: () => {
							setReplyText(trimmedContent);
							setReplyingTo(parentId);
						},
					},
				});
				return;
			}

			// 서버 응답으로 교체
			await fetchComments();
		});
	};

	const handleLoadMore = () => {
		if (nextCursor) {
			startTransition(() => {
				fetchComments(nextCursor);
			});
		}
	};

	const handleStartEdit = (commentId: string, content: string) => {
		setEditingId(commentId);
		setEditContent(content);
		setReplyingTo(null);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditContent("");
	};

	const handleSaveEdit = (commentId: string) => {
		if (!editContent.trim()) return;

		const trimmedContent = editContent.trim();

		// 이전 내용 저장 (롤백용)
		const findOriginalContent = (): string | null => {
			for (const comment of comments) {
				if (comment.id === commentId) return comment.content;
				for (const reply of comment.replies) {
					if (reply.id === commentId) return reply.content;
				}
			}
			return null;
		};
		const originalContent = findOriginalContent();

		// 낙관적 업데이트
		setComments((prev) =>
			prev.map((comment) => {
				if (comment.id === commentId) {
					return { ...comment, content: trimmedContent };
				}
				return {
					...comment,
					replies: comment.replies.map((reply) =>
						reply.id === commentId
							? { ...reply, content: trimmedContent }
							: reply,
					),
				};
			}),
		);
		setEditingId(null);
		setEditContent("");

		startTransition(async () => {
			const { error } = await api
				.posts({ id: postId })
				.comments({ commentId })
				.put({ content: trimmedContent });

			if (error) {
				// 롤백
				if (originalContent) {
					setComments((prev) =>
						prev.map((comment) => {
							if (comment.id === commentId) {
								return { ...comment, content: originalContent };
							}
							return {
								...comment,
								replies: comment.replies.map((reply) =>
									reply.id === commentId
										? { ...reply, content: originalContent }
										: reply,
								),
							};
						}),
					);
				}
				toast.error("댓글 수정에 실패했습니다", {
					action: {
						label: "재시도",
						onClick: () => {
							setEditingId(commentId);
							setEditContent(trimmedContent);
						},
					},
				});
				return;
			}

			toast.success("댓글이 수정되었습니다");
		});
	};

	const handleDelete = (commentId: string) => {
		if (!confirm("댓글을 삭제하시겠습니까?")) return;

		// 이전 상태 저장 (롤백용)
		const previousComments = [...comments];
		const previousTotalCount = totalCount;

		// 낙관적 업데이트: 댓글 또는 답글 제거
		let isParentComment = false;
		setComments((prev) => {
			// 먼저 부모 댓글인지 확인
			const parentComment = prev.find((c) => c.id === commentId);
			if (parentComment) {
				isParentComment = true;
				// 답글이 있으면 삭제 표시만, 없으면 완전 제거
				if (parentComment.replies.length > 0) {
					return prev.map((c) =>
						c.id === commentId
							? { ...c, content: "", deletedAt: new Date().toISOString() }
							: c,
					);
				}
				return prev.filter((c) => c.id !== commentId);
			}
			// 답글인 경우
			return prev.map((comment) => ({
				...comment,
				replies: comment.replies.filter((r) => r.id !== commentId),
				replyCount:
					comment.replies.some((r) => r.id === commentId)
						? comment.replyCount - 1
						: comment.replyCount,
			}));
		});

		if (isParentComment) {
			setTotalCount((prev) => prev - 1);
		}

		startTransition(async () => {
			const { error } = await api
				.posts({ id: postId })
				.comments({ commentId })
				.delete();

			if (error) {
				// 롤백
				setComments(previousComments);
				setTotalCount(previousTotalCount);
				toast.error("댓글 삭제에 실패했습니다");
				return;
			}

			// 서버 상태와 동기화
			await fetchComments();
			toast.success("댓글이 삭제되었습니다");
		});
	};

	const isOwner = (userId: string) => currentUserId === userId;

	return (
		<div {...stylex.props(styles.section)}>
			<div {...stylex.props(styles.header)}>
				<h2 {...stylex.props(styles.title)}>댓글 {totalCount}</h2>
			</div>

			{isLoggedIn ? (
				<div {...stylex.props(styles.commentForm)}>
					<input
						type="text"
						placeholder="댓글을 입력하세요"
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmitComment();
							}
						}}
						disabled={isPending}
						{...stylex.props(styles.commentInput)}
					/>
					<button
						type="button"
						onClick={handleSubmitComment}
						disabled={isPending || !commentText.trim()}
						{...stylex.props(
							styles.submitButton,
							(isPending || !commentText.trim()) && styles.submitButtonDisabled,
						)}
					>
						<Send size={18} />
					</button>
				</div>
			) : (
				<div {...stylex.props(styles.loginPrompt)}>
					<span>댓글을 작성하려면</span>
					<Link href="/login" {...stylex.props(styles.loginLink)}>
						<LogIn size={14} />
						로그인
					</Link>
					<span>해주세요</span>
				</div>
			)}

			{comments.length === 0 ? (
				<p {...stylex.props(styles.emptyComments)}>첫 번째 댓글을 남겨보세요</p>
			) : (
				<>
					{comments.map((comment) => (
						<div key={comment.id} {...stylex.props(styles.commentItem)}>
							<div {...stylex.props(styles.commentHeader)}>
								{comment.user.profileImage ? (
									<img
										src={comment.user.profileImage}
										alt={comment.user.nickname}
										{...stylex.props(styles.avatar)}
									/>
								) : (
									<div {...stylex.props(styles.avatar)} />
								)}
								<span {...stylex.props(styles.authorName)}>
									{comment.user.nickname}
								</span>
								<span {...stylex.props(styles.commentDate)}>
									· {formatRelativeTime(comment.createdAt)}
								</span>
							</div>

							{editingId === comment.id ? (
								<div {...stylex.props(styles.editForm)}>
									<input
										type="text"
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleSaveEdit(comment.id);
											}
											if (e.key === "Escape") {
												handleCancelEdit();
											}
										}}
										disabled={isPending}
										{...stylex.props(styles.editInput)}
									/>
									<button
										type="button"
										onClick={() => handleSaveEdit(comment.id)}
										disabled={isPending || !editContent.trim()}
										{...stylex.props(
											styles.editButton,
											styles.editSaveButton,
											(isPending || !editContent.trim()) &&
												styles.submitButtonDisabled,
										)}
									>
										<Check size={14} />
									</button>
									<button
										type="button"
										onClick={handleCancelEdit}
										disabled={isPending}
										{...stylex.props(styles.editButton, styles.editCancelButton)}
									>
										<X size={14} />
									</button>
								</div>
							) : (
								<p
									{...stylex.props(
										styles.commentContent,
										comment.deletedAt ? styles.deletedContent : null,
									)}
								>
									{comment.deletedAt ? "삭제된 댓글입니다" : comment.content}
								</p>
							)}

							{!comment.deletedAt && (
								<div {...stylex.props(styles.commentActions)}>
									{isLoggedIn && (
										<button
											type="button"
											onClick={() =>
												setReplyingTo(
													replyingTo === comment.id ? null : comment.id,
												)
											}
											{...stylex.props(styles.actionButton)}
										>
											<MessageCircle size={14} />
											<span>
												답글 {comment.replyCount > 0 && comment.replyCount}
											</span>
										</button>
									)}
									{isOwner(comment.user.id) && editingId !== comment.id && (
										<>
											<button
												type="button"
												onClick={() =>
													handleStartEdit(comment.id, comment.content)
												}
												{...stylex.props(styles.actionButton)}
											>
												<Pencil size={14} />
												<span>수정</span>
											</button>
											<button
												type="button"
												onClick={() => handleDelete(comment.id)}
												{...stylex.props(styles.actionButton, styles.dangerButton)}
											>
												<Trash2 size={14} />
												<span>삭제</span>
											</button>
										</>
									)}
								</div>
							)}

							{comment.replies.length > 0 && (
								<div {...stylex.props(styles.repliesSection)}>
									{comment.replies.map((reply) => (
										<div key={reply.id} {...stylex.props(styles.replyItem)}>
											<CornerDownRight
												size={14}
												{...stylex.props(styles.replyIcon)}
											/>
											<div {...stylex.props(styles.replyContent)}>
												<div {...stylex.props(styles.replyHeader)}>
													{reply.user.profileImage ? (
														<img
															src={reply.user.profileImage}
															alt={reply.user.nickname}
															{...stylex.props(styles.replyAvatar)}
														/>
													) : (
														<div {...stylex.props(styles.replyAvatar)} />
													)}
													<span {...stylex.props(styles.authorName)}>
														{reply.user.nickname}
													</span>
													<span {...stylex.props(styles.commentDate)}>
														· {formatRelativeTime(reply.createdAt)}
													</span>
												</div>
												{editingId === reply.id ? (
													<div {...stylex.props(styles.editForm)}>
														<input
															type="text"
															value={editContent}
															onChange={(e) => setEditContent(e.target.value)}
															onKeyDown={(e) => {
																if (e.key === "Enter" && !e.shiftKey) {
																	e.preventDefault();
																	handleSaveEdit(reply.id);
																}
																if (e.key === "Escape") {
																	handleCancelEdit();
																}
															}}
															disabled={isPending}
															{...stylex.props(styles.editInput)}
														/>
														<button
															type="button"
															onClick={() => handleSaveEdit(reply.id)}
															disabled={isPending || !editContent.trim()}
															{...stylex.props(
																styles.editButton,
																styles.editSaveButton,
																(isPending || !editContent.trim()) &&
																	styles.submitButtonDisabled,
															)}
														>
															<Check size={14} />
														</button>
														<button
															type="button"
															onClick={handleCancelEdit}
															disabled={isPending}
															{...stylex.props(
																styles.editButton,
																styles.editCancelButton,
															)}
														>
															<X size={14} />
														</button>
													</div>
												) : (
													<p
														{...stylex.props(
															styles.replyText,
															reply.deletedAt ? styles.deletedContent : null,
														)}
													>
														{reply.deletedAt
															? "삭제된 댓글입니다"
															: reply.content}
													</p>
												)}
												{isOwner(reply.user.id) &&
													!reply.deletedAt &&
													editingId !== reply.id && (
														<div {...stylex.props(styles.replyActions)}>
															<button
																type="button"
																onClick={() =>
																	handleStartEdit(reply.id, reply.content)
																}
																{...stylex.props(styles.actionButton)}
															>
																<Pencil size={12} />
																<span>수정</span>
															</button>
															<button
																type="button"
																onClick={() => handleDelete(reply.id)}
																{...stylex.props(
																	styles.actionButton,
																	styles.dangerButton,
																)}
															>
																<Trash2 size={12} />
																<span>삭제</span>
															</button>
														</div>
													)}
											</div>
										</div>
									))}
								</div>
							)}

							{replyingTo === comment.id && (
								<div {...stylex.props(styles.replyForm)}>
									<input
										type="text"
										placeholder={`${comment.user.nickname}님에게 답글`}
										value={replyText}
										onChange={(e) => setReplyText(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleSubmitReply(comment.id);
											}
										}}
										disabled={isPending}
										{...stylex.props(styles.replyInput)}
									/>
									<button
										type="button"
										onClick={() => handleSubmitReply(comment.id)}
										disabled={isPending || !replyText.trim()}
										{...stylex.props(
											styles.replySubmitButton,
											(isPending || !replyText.trim()) &&
												styles.submitButtonDisabled,
										)}
									>
										<Send size={14} />
									</button>
								</div>
							)}
						</div>
					))}

					{hasMore && (
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={isPending}
							{...stylex.props(styles.loadMoreButton)}
						>
							<span>더보기</span>
							<ChevronDown size={16} />
						</button>
					)}
				</>
			)}
		</div>
	);
}
