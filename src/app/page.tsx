import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategorySection } from "@/components/home/category-section"
import { NewsletterSection } from "@/components/home/newsletter-section"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedProducts />
      <CategorySection />
      <NewsletterSection />
    </div>
  )
}
