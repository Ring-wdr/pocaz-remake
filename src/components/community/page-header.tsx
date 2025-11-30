import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "20px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 800,
		color: "#000",
		margin: 0,
	},
	writeButton: {
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
	writeIcon: {
		fontSize: "16px",
	},
});

export default function PageHeader() {
	return (
		<div {...stylex.props(styles.header)}>
			<h1 {...stylex.props(styles.title)}>커뮤니티</h1>
			<Link href="/community/write" {...stylex.props(styles.writeButton)}>
				<i className="ri-edit-line" {...stylex.props(styles.writeIcon)} />
				글쓰기
			</Link>
		</div>
	);
}
