import { HeroSection } from "@/components/home/hero-section"
import FeaturedProducts from "@/components/home/products-featured"
import SaleProducts from "@/components/home/products-sale"
import NewProducts from "@/components/home/products-new"
import { CategorySection } from "@/components/home/category-section"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { BenefitsBar } from "@/components/home/benefits-bar"
import Reviews from "@/components/home/reviews"
import { Footer } from "@/components/layout/footer"


export default function HomePage() {
  return (
    <div className="flex flex-col">
      <BenefitsBar />
      <HeroSection />
      <FeaturedProducts className="my-8" />
      <NewProducts className="my-8"/>
      <CategorySection />
      <SaleProducts className="my-8" />
      <Reviews />
      <Footer />
    </div>  
  )
}
