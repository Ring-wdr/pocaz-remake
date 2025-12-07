import * as stylex from "@stylexjs/stylex";
import { Loader2 } from "lucide-react";

const spin = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	icon: {
		animationName: spin,
		animationDuration: "0.9s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

export default function LoadMoreSpinner({ size = 16 }: { size?: number }) {
	return <Loader2 size={size} {...stylex.props(styles.icon)} />;
}
