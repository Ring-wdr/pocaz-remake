"use client";

import * as stylex from "@stylexjs/stylex";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useActionState,
	useEffect,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";
import type { MarketLikeState } from "./toggle-market-like";
import { toggleMarketLike } from "./toggle-market-like";

const styles = stylex.create({
	actionBar: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		backgroundColor: colors.bgPrimary,
	},
	actionButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "44px",
		height: "44px",
		color: colors.textMuted,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	chatButton: {
		flex: 1,
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
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	chatButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
	actionButtonActive: {
		color: colors.statusErrorLight,
		borderColor: colors.statusErrorLight,
	},
	likeError: {
		width: "100%",
		marginTop: spacing.xxxs,
		fontSize: fontSize.sm,
		color: colors.statusError,
	},
});

const LIKE_THROTTLE_MS = 600;
const SYNC_DEBOUNCE_MS = LIKE_THROTTLE_MS;

interface ActionBarProps {
	marketId: string;
	sellerId: string;
	currentUserId: string | null;
	isOwner: boolean;
	marketTitle: string;
	initialLikeState: MarketLikeState;
}

export function ActionBar({
	marketId,
	sellerId,
	currentUserId,
	isOwner,
	marketTitle,
	initialLikeState,
}: ActionBarProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [, startTransition] = useTransition();
	const lastLikeAtRef = useRef(0);
	const formRef = useRef<HTMLFormElement | null>(null);
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pendingSyncRef = useRef(false);
	const [likeState, formAction] = useActionState<MarketLikeState, FormData>(
		toggleMarketLike,
		initialLikeState,
	);
	const [optimisticLike, addOptimisticLike] = useOptimistic<
		MarketLikeState,
		"toggle"
	>(likeState, (state) => ({
		...state,
		liked: !state.liked,
		count: state.liked ? Math.max(state.count - 1, 0) : state.count + 1,
		error: null,
	}));

	useEffect(() => {
		if (!likeState.error) return;
		toast.error(likeState.error);
	}, [likeState.error]);

	const handleLikeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!currentUserId) {
			event.preventDefault();
			router.push("/login");
			return;
		}

		if (isOwner) {
			event.preventDefault();
			toast.info("내 상품은 찜할 수 없어요.");
			return;
		}

		startTransition(() => addOptimisticLike("toggle"));

		const now = Date.now();
		const delta = now - lastLikeAtRef.current;
		if (delta < LIKE_THROTTLE_MS) {
			event.preventDefault();
			if (!pendingSyncRef.current) {
				pendingSyncRef.current = true;
				const wait = Math.max(LIKE_THROTTLE_MS - delta, SYNC_DEBOUNCE_MS);
				if (syncTimeoutRef.current) {
					clearTimeout(syncTimeoutRef.current);
				}
				syncTimeoutRef.current = setTimeout(() => {
					formRef.current?.requestSubmit();
					lastLikeAtRef.current = Date.now();
					pendingSyncRef.current = false;
				}, wait);
			}
			return;
		}

		lastLikeAtRef.current = now;
	};

	const handleShare = async () => {
		const shareUrl = typeof window !== "undefined" ? window.location.href : "";

		try {
			if (navigator.share) {
				await navigator.share({
					title: marketTitle,
					url: shareUrl,
				});
				toast.success("공유 링크를 보냈습니다.");
				return;
			}

			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shareUrl);
				toast.success("링크를 복사했습니다.");
				return;
			}

			toast.error("공유를 지원하지 않는 환경입니다.");
		} catch (err) {
			console.error("Share failed", err);
			toast.error("공유에 실패했습니다.");
		}
	};

	const handleChatClick = async () => {
		if (!currentUserId) {
			router.push("/login");
			return;
		}

		if (isOwner) {
			// 판매자: 해당 마켓의 채팅방 목록으로 이동
			router.push(`/chat/list?marketId=${marketId}`);
			return;
		}

		// 구매자: 채팅방 생성/조회 후 이동
		setIsLoading(true);
		try {
			const { data, error } = await api.chat.rooms.market.post({
				marketId,
				sellerId,
			});

			if (error || !data) {
				console.error("Failed to create/get chat room:", error);
				return;
			}

			router.push(`/chat/${data.id}`);
		} catch (err) {
			console.error("Chat error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.actionBar)}>
			<form ref={formRef} action={formAction}>
				<input type="hidden" name="marketId" value={marketId} />
				<button
					type="submit"
					onClick={handleLikeClick}
					aria-pressed={optimisticLike.liked}
					aria-label={`찜 ${optimisticLike.count}회`}
					{...stylex.props(
						styles.actionButton,
						optimisticLike.liked && styles.actionButtonActive,
					)}
				>
					<Heart
						size={20}
						fill={optimisticLike.liked ? "currentColor" : "none"}
					/>
				</button>
			</form>
			<button
				type="button"
				onClick={handleShare}
				{...stylex.props(styles.actionButton)}
			>
				<Share2 size={20} />
			</button>
			<button
				type="button"
				onClick={handleChatClick}
				disabled={isLoading}
				{...stylex.props(
					styles.chatButton,
					isLoading && styles.chatButtonDisabled,
				)}
			>
				<MessageCircle size={18} />
				{isLoading ? "로딩..." : isOwner ? "채팅 목록" : "채팅하기"}
			</button>
		</div>
	);
}
