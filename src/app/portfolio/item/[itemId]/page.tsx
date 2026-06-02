'use client'
import { useParams } from 'next/navigation'
import { PortfolioItemForm } from '../_form'

export default function EditPortfolioItemPage() {
  const { itemId } = useParams<{ itemId: string }>()
  return <PortfolioItemForm editId={itemId} />
}
