import { getContentSection } from '@/lib/content'
import FooterClient from './FooterClient'

export default async function Footer() {
  // Load content on server - no flash!
  const footerContent = await getContentSection('footer')

  return <FooterClient initialContent={footerContent} />
}