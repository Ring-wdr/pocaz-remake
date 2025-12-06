import { overlay } from "overlay-kit";
import { ChatRoomMenuBottomSheet } from "./chat-room-menu-bottom-sheet";

export type ChatRoomMenuAction = "leave" | null;

/**
 * 채팅방 메뉴 바텀시트를 overlay-kit으로 호출
 *
 * @example
 * const action = await openChatRoomMenu();
 * if (action === "leave") {
 *   // 채팅방 나가기 로직
 * }
 */
export async function openChatRoomMenu(): Promise<ChatRoomMenuAction> {
	return overlay.openAsync<ChatRoomMenuAction>(({ isOpen, close, unmount }) => {
		if (!isOpen) {
			return null;
		}

		const handleLeaveRoom = () => {
			close("leave");
			setTimeout(unmount, 200);
		};

		const handleClose = () => {
			close(null);
			setTimeout(unmount, 200);
		};

		return (
			<ChatRoomMenuBottomSheet
				isLeaving={false}
				onLeaveRoom={handleLeaveRoom}
				onClose={handleClose}
			/>
		);
	});
}
