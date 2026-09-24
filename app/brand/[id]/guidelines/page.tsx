import { redirect } from 'next/navigation'

export default async function GuidelinesRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/brand/${id}`)
}
