import { api } from "@/utils/eden";

export async function SuspenseTest() {
	const { data } = await api.get();
	return <div>{data} TEST </div>;
}
