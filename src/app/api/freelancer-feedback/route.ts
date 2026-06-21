import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, subject, comment, rating } = await request.json()

    if (!category || !comment) {
      return NextResponse.json({ error: 'Category and comment are required.' }, { status: 400 })
    }

    // Validate category value
    const validCategories = ['feature_request', 'bug_report', 'support_message', 'nps_score']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }

    // Validate rating range if provided
    if (rating !== undefined && rating !== null) {
      const parsedRating = parseInt(rating, 10)
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return NextResponse.json({ error: 'Rating must be between 1 and 10.' }, { status: 400 })
      }
    }

    const { error } = await supabase.from('freelancer_feedback').insert({
      user_id: user.id,
      category,
      subject: subject || null,
      comment,
      rating: rating ? parseInt(rating, 10) : null,
      status: 'pending',
    })

    if (error) {
      console.error('[Freelancer Feedback API] Insert Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Freelancer Feedback API] Unexpected Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
