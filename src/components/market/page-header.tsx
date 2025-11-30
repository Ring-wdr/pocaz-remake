import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 800,
		color: "#000",
		margin: 0,
	},
	registerButton: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		paddingTop: "8px",
		paddingBottom: "8px",
		paddingLeft: "14px",
		paddingRight: "14px",
		fontSize: "14px",
		fontWeight: 600,
		color: "#fff",
		backgroundColor: "#000",
		borderRadius: "8px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	registerIcon: {
		fontSize: "16px",
	},
});

export default function PageHeader() {
	return (
		<div {...stylex.props(styles.header)}>
			<h1 {...stylex.props(styles.title)}>마켓</h1>
			<Link href="/market/register" {...stylex.props(styles.registerButton)}>
				<i className="ri-add-line" {...stylex.props(styles.registerIcon)} />
				등록하기
			</Link>
		</div>
	);
}
