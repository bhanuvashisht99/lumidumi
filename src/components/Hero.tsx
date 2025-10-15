import { getContentSection } from '@/lib/content'
import HeroClient from './HeroClient'

export default async function Hero() {
  // Load content on server - no flash, no loading state needed!
  const heroContent = await getContentSection('hero')

  return <HeroClient initialContent={heroContent} />
}