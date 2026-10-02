"use client";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { colors, fontSize } from "@/app/global-tokens.stylex";
import { groupArtistsQueryOptions } from "@/lib/queries/artists";
import type { ArtistTag } from "@/types/entities";
import type { InitialGroupArtists } from "../types";
import ChipGroup from "./chip-group";
import FilterChip from "./filter-chip";

const styles = stylex.create({
	// 멤버를 불러오는 동안이나 실패했을 때 칩 자리에 놓는 안내
	hint: {
		alignSelf: "center",
		fontSize: fontSize.sm,
		color: colors.textMuted,
		whiteSpace: "nowrap",
	},
});

type ArtistFilterProps = {
	groups: ArtistTag[];
	/** 고른 그룹. 전체면 null */
	groupId: string | null;
	/** 고른 멤버. 그룹 전체면 null */
	artistId: string | null;
	/** 서버가 미리 가져온 멤버 목록. 처음 화면의 그룹과 같을 때만 쓴다 */
	initialGroupArtists: InitialGroupArtists | null;
	onGroupChange: (groupId: string | null) => void;
	onArtistChange: (artistId: string | null) => void;
};

/**
 * 그룹 칩 줄과, 그룹을 고르면 나타나는 그 그룹의 멤버 칩 줄.
 * 멤버 목록은 그룹을 고를 때 클라이언트에서 가져오고, 한 번 가져온 그룹은 캐시에서 바로 보여 준다.
 */
export default function ArtistFilter({
	groups,
	groupId,
	artistId,
	initialGroupArtists,
	onGroupChange,
	onArtistChange,
}: ArtistFilterProps) {
	const artistsQuery = useQuery({
		...groupArtistsQueryOptions(groupId ?? ""),
		enabled: groupId !== null,
		initialData:
			initialGroupArtists && initialGroupArtists.groupId === groupId
				? initialGroupArtists.artists
				: undefined,
	});

	// 그룹 카탈로그가 비어 있으면(시드 전이거나 불러오지 못함) 줄 자체를 그리지 않는다
	if (groups.length === 0) return null;

	return (
		<>
			<ChipGroup label="그룹">
				<FilterChip
					active={groupId === null}
					onClick={() => onGroupChange(null)}
				>
					전체
				</FilterChip>
				{groups.map((group) => (
					<FilterChip
						key={group.id}
						active={groupId === group.id}
						onClick={() => onGroupChange(group.id)}
					>
						{group.name}
					</FilterChip>
				))}
			</ChipGroup>
			{groupId !== null && (
				<ChipGroup label="멤버">
					<FilterChip
						active={artistId === null}
						onClick={() => onArtistChange(null)}
					>
						그룹 전체
					</FilterChip>
					{artistsQuery.data?.map((artist) => (
						<FilterChip
							key={artist.id}
							active={artistId === artist.id}
							onClick={() => onArtistChange(artist.id)}
						>
							{artist.name}
						</FilterChip>
					))}
					{artistsQuery.isPending && (
						<span {...stylex.props(styles.hint)}>멤버를 불러오는 중...</span>
					)}
					{artistsQuery.isError && (
						<span {...stylex.props(styles.hint)}>멤버를 불러오지 못했어요</span>
					)}
				</ChipGroup>
			)}
		</>
	);
}
