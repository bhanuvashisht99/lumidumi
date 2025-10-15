import { getContentSection } from '@/lib/content'
import AboutClient from './AboutClient'

export default async function About() {
  // Load content on server - no flash!
  const aboutContent = await getContentSection('about')

  return <AboutClient initialContent={aboutContent} />
}