import { redirect } from "next/navigation";

export default async function EditSubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/edit/sublet/${id}`);
}
