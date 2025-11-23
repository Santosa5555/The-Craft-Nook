'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Continuous Gradient Background */}
      <div className="from-foreground via-foreground/95 via-primary/5 to-background/90 absolute inset-0 z-0 bg-gradient-to-br" />

      {/* Optional Background Image - Subtle */}
      <div className="absolute inset-0 z-[1] opacity-20">
        <Image
          src="/home1.jpg"
          alt="Handcrafted goods"
          fill
          priority
          className="object-cover mix-blend-overlay"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="to-background/30 absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent" />

      {/* Animated Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        <div className="bg-primary/10 absolute -top-20 -left-20 h-96 w-96 animate-pulse rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute -right-20 -bottom-20 h-[32rem] w-[32rem] animate-pulse rounded-full blur-3xl delay-1000" />
        <div className="bg-accent/5 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center md:px-6">
        {/* Badge */}
        <div className="border-primary/30 bg-background/80 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-md">
          <Sparkles className="h-4 w-4" />
          <span>Handcrafted with Love</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-foreground mb-6 font-serif text-4xl leading-tight font-bold drop-shadow-lg md:text-5xl lg:text-6xl xl:text-7xl">
          <span className="block drop-shadow-md">Discover Unique</span>
          <span className="from-primary via-primary to-secondary block bg-gradient-to-r bg-clip-text text-transparent drop-shadow-md">
            Handcrafted Treasures
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-foreground mx-auto mb-8 max-w-2xl text-lg leading-relaxed font-medium drop-shadow-md md:text-xl lg:text-2xl">
          Each piece tells a story, crafted with care by talented artisans. Bring warmth and
          character to your home with our curated collection of handmade goods.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 h-12 bg-gradient-to-r px-8 text-base font-semibold shadow-xl transition-all hover:shadow-2xl"
          >
            <Link href="/products" className="flex items-center gap-2">
              Explore Collection
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-foreground/20 bg-background/60 hover:bg-background/80 hover:border-primary h-12 border-2 px-8 text-base font-semibold backdrop-blur-sm transition-all"
          >
            <Link href="/about" className="flex items-center gap-2">
              <Heart className="fill-destructive text-destructive h-5 w-5" />
              Our Story
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="text-foreground mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-medium drop-shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-2.5 w-2.5 rounded-full shadow-sm" />
            <span>100% Handmade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-secondary h-2.5 w-2.5 rounded-full shadow-sm" />
            <span>Artisan Made</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-accent h-2.5 w-2.5 rounded-full shadow-sm" />
            <span>Eco-Friendly</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="border-primary/30 flex h-10 w-6 items-start justify-center rounded-full border-2 p-1 backdrop-blur-sm">
          <div className="bg-primary/50 h-3 w-1.5 rounded-full" />
        </div>
      </div>
    </section>
  );
}
