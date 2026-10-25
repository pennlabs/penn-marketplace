import { redirect } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/edit/item/${id}`);
}
