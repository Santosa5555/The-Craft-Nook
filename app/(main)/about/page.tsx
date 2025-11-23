import { Heart, Sparkles, Users, Leaf, Award, HandHeart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    {
      icon: HandHeart,
      title: 'Handcrafted Excellence',
      description: 'Every piece is carefully crafted by skilled artisans who pour their passion and expertise into each creation.',
      color: 'text-primary',
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'We prioritize eco-friendly materials and sustainable production methods to protect our planet.',
      color: 'text-secondary',
    },
    {
      icon: Users,
      title: 'Supporting Artisans',
      description: 'We partner with talented craftspeople worldwide, ensuring fair wages and supporting local communities.',
      color: 'text-accent',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Each product undergoes rigorous quality checks to ensure it meets our high standards of excellence.',
      color: 'text-primary',
    },
  ];

  const stats = [
    { number: '500+', label: 'Artisan Partners' },
    { number: '10K+', label: 'Happy Customers' },
    { number: '50+', label: 'Countries Served' },
    { number: '100%', label: 'Handmade' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-foreground via-foreground/95 via-primary/5 to-background/90" />
        
        {/* Decorative Orbs */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-[32rem] w-[32rem] animate-pulse rounded-full bg-secondary/10 blur-3xl delay-1000" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-4 py-2 text-sm font-semibold text-primary shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Our Story</span>
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-foreground drop-shadow-lg md:text-5xl lg:text-6xl">
            <span className="block">Crafted with</span>
            <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Passion & Purpose
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-foreground drop-shadow-md md:text-xl">
            We believe in the beauty of handmade, the warmth of tradition, and the power of
            connecting artisans with those who appreciate true craftsmanship.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                How It All Began
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Handmade Haven was born from a simple belief: that every handcrafted piece tells
                  a story worth sharing. What started as a small marketplace for local artisans has
                  grown into a global community celebrating the art of handmade.
                </p>
                <p className="text-lg leading-relaxed">
                  Our founder, inspired by the intricate beauty of traditional crafts during travels
                  around the world, envisioned a platform where artisans could showcase their work
                  and customers could discover unique, meaningful pieces.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we're proud to connect thousands of talented craftspeople with customers
                  who value authenticity, quality, and the human touch in every product.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-32 w-32 fill-primary/20 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 font-serif text-4xl font-bold text-primary md:text-5xl">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-muted-foreground md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              What We Stand For
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Our core values guide everything we do, from selecting artisans to delivering your
              perfect piece.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="group border-primary/20 bg-background/50 transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-lg bg-primary/10 p-3 ${value.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative border-y border-border bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Our Mission
          </h2>
          <p className="mx-auto mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            To preserve traditional craftsmanship while empowering artisans worldwide, creating a
            sustainable marketplace where every purchase supports both the maker and the planet.
          </p>
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-background/80 p-8 shadow-lg backdrop-blur-sm">
            <p className="text-lg italic leading-relaxed text-foreground">
              "We don't just sell products; we curate stories, preserve traditions, and build
              bridges between artisans and the people who treasure their work."
            </p>
            <p className="mt-4 font-semibold text-primary">— The Handmade Haven Team</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Join Our Community
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Discover unique handcrafted treasures or become part of our artisan family.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:from-primary/90 hover:to-secondary/90 hover:shadow-xl"
            >
              Explore Collection
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-background/80 px-8 py-3 font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10"
            >
              Become an Artisan
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

