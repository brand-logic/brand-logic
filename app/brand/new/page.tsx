
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NewBrandForm } from './new-brand-form'

export default async function NewBrandPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return <NewBrandForm />
}
