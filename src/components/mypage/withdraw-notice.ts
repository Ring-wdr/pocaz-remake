// 회원 탈퇴 안내 문구. 탈퇴 화면(mypage/security)과 FAQ가 같은 사실을 말하도록 한 곳에 둔다.
// 문구는 userService.softDelete가 실제로 하는 일과 같아야 한다.
// - 지우는 것: 계정(User 행)의 이메일·닉네임·프로필 사진. Supabase ID를 떼어 내서 같은 소셜 계정으로 다시 로그인하면 새 계정이 된다.
// - 남는 것: 글·댓글·판매글·채팅 메시지·거래 내역(작성자는 "탈퇴한 사용자"로 보인다),
//   Supabase Auth 계정(이메일·이름), 스토리지에 올린 프로필 사진 파일.

/** 지워지는 것 */
export const WITHDRAW_DELETED_NOTICE =
	"이메일, 닉네임, 프로필 사진은 계정에서 지워지며 복구할 수 없습니다.";

/** 지워지지 않고 남는 것 */
export const WITHDRAW_KEPT_NOTICE =
	"작성한 게시글, 댓글, 판매글, 채팅 메시지와 거래 내역은 삭제되지 않고 '탈퇴한 사용자'의 기록으로 남습니다.";

/** 로그인 인증을 맡는 서비스(Supabase Auth)에 남는 것 */
export const WITHDRAW_AUTH_NOTICE =
	"소셜 로그인 계정의 인증 정보(이메일, 이름)는 인증 서비스에 남습니다.";
