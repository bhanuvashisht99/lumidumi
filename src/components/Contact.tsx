import { getContentSection } from '@/lib/content'
import ContactClient from './ContactClient'

export default async function Contact() {
  // Load content on server - no flash!
  const contactContent = await getContentSection('contact')

  return <ContactClient initialContent={contactContent} />
}