import { t } from "elysia";

/**
 * 목록 API의 페이지 크기 쿼리. 숫자가 아니거나 1~50을 벗어나면 422로 거부한다.
 */
export const LimitQuery = t.Optional(
	t.Numeric({ minimum: 1, maximum: 50, description: "페이지 크기 (1~50)" }),
);
