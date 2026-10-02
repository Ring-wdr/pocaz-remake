"use client";

import * as stylex from "@stylexjs/stylex";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	// 내가 보낸(오른쪽에 놓인) 말풍선 아래에 맞춰 오른쪽으로 모은다
	actions: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: spacing.xxs,
		marginTop: spacing.xxxs,
	},
	text: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		fontSize: fontSize.sm,
		color: colors.statusError,
	},
	button: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		fontSize: fontSize.sm,
		color: colors.accentPrimary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
	},
});

interface ChatFailedMessageActionsProps {
	/** 전송에 실패한 메시지의 내용. 다시 보낼 때 그대로 보낸다 */
	content: string;
	/** 실패한 메시지를 가리키는 클라이언트 id. 다시 보내도 같은 메시지로 남도록 그대로 넘긴다 */
	clientId: string;
	/** "재시도": 같은 내용과 clientId로 다시 보내라는 요청. 전송 중 상태로 되돌리는 일은 받는 쪽이 한다 */
	onRetry: (content: string, clientId: string) => void;
	/** "삭제": 실패한 메시지를 목록에서 지운다 */
	onDelete: (clientId: string) => void;
}

/**
 * 전송에 실패한 내 메시지 아래에 붙는 "전송 실패" 안내와 재시도·삭제 버튼.
 */
export function ChatFailedMessageActions({
	content,
	clientId,
	onRetry,
	onDelete,
}: ChatFailedMessageActionsProps) {
	return (
		<div {...stylex.props(styles.actions)}>
			<span {...stylex.props(styles.text)}>
				<AlertCircle size={12} />
				전송 실패
			</span>
			<button
				type="button"
				onClick={() => onRetry(content, clientId)}
				{...stylex.props(styles.button)}
			>
				<RefreshCw size={12} />
				재시도
			</button>
			<button
				type="button"
				onClick={() => onDelete(clientId)}
				{...stylex.props(styles.button)}
			>
				<X size={12} />
				삭제
			</button>
		</div>
	);
}
