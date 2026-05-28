import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjojacqzpujdesxqqcnf.supabase.co'
const supabaseKey = 'sb_publishable_yvwjUz-ZF0Ri3xmznLbVBw_uq2KP9gU'

export const supabase = createClient(supabaseUrl, supabaseKey)
