// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import { useQuery } from '@tanstack/react-query';
// import { fetchHeroSection } from '@/lib/api/heroSection';
// import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
// import Autoplay from 'embla-carousel-autoplay';
// import { Button } from '../general/Button';
// import { HeroSectionType } from '@/types/heroSection';

// const FALLBACK_IMAGE = '/banner-background.png';

// const HeroSection = () => {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ['hero-section'],
//     queryFn: fetchHeroSection,
//   });

//   const heroSections = data?.heroSections ?? [];

//   if (isLoading) {
//     return (
//       <section className="before:bg-neutral-darker/50 relative flex min-h-[calc(100svh-80px)] items-center justify-center before:absolute before:inset-0 before:z-1 sm:min-h-[calc(100svh-96px)]">
//         <Image
//           src={FALLBACK_IMAGE}
//           alt="Default hero image"
//           fill
//           className="absolute inset-0 object-cover"
//           priority
//         />
//         <div className="content-wrapper">
//           <div className="relative z-1 flex h-full flex-col gap-10 text-center text-white">
//             <h1 className="text-5xl font-semibold sm:text-7xl lg:text-8xl">Taste of Nepal</h1>
//             <div className="mx-auto flex max-w-[672px] flex-col items-center justify-center gap-6">
//               <p className="px-2 text-lg font-extralight sm:text-2xl">
//                 From spicy noodles to Himalayan teas, explore the authentic flavors of Nepal -
//                 Delivered fresh across the UK
//               </p>
//               <div className="flex gap-4">
//                 <Button
//                   variant="primary"
//                   text="Shop Now"
//                   href="/products"
//                   className="!px-6 !py-4"
//                 />
//                 <Button
//                   variant="outline"
//                   text="About Us"
//                   href="/about"
//                   className="text-neutral-light !px-6 !py-4"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (isError || heroSections.length === 0) {
//     return (
//       <section className="before:bg-neutral-darker/50 relative flex min-h-[calc(100svh-80px)] items-center justify-center before:absolute before:inset-0 before:z-1 sm:min-h-[calc(100svh-96px)]">
//         <Image
//           src={FALLBACK_IMAGE}
//           alt="Default hero image"
//           fill
//           className="absolute inset-0 object-cover"
//           priority
//         />
//         <div className="content-wrapper">
//           <div className="relative z-1 flex h-full flex-col gap-10 text-center text-white">
//             <h1 className="text-5xl font-semibold sm:text-7xl lg:text-8xl">Taste of Nepal</h1>
//             <div className="mx-auto flex max-w-[672px] flex-col items-center justify-center gap-6">
//               <p className="px-2 text-lg font-extralight sm:text-2xl">
//                 From spicy noodles to Himalayan teas, explore the authentic flavors of Nepal -
//                 Delivered fresh across the UK
//               </p>
//               <div className="flex gap-4">
//                 <Button
//                   variant="primary"
//                   text="Shop Now"
//                   href="/products"
//                   className="!px-6 !py-4"
//                 />
//                 {/* <Button
//                   variant="outline"
//                   text="About Us"
//                   href="/about"
//                   className="text-neutral-light !px-6 !py-4"
//                 /> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   const images = heroSections.flatMap((hero: HeroSectionType) =>
//     hero.imageUrls && hero.imageUrls.length > 0 ? hero.imageUrls : [FALLBACK_IMAGE]
//   );

//   return (
//     <section className="relative flex min-h-[calc(100svh-80px)] items-center justify-center sm:min-h-[calc(100svh-96px)]">
//       <Carousel
//         plugins={[
//           Autoplay({
//             delay: 3000,
//             stopOnInteraction: false,
//           }),
//         ]}
//         opts={{
//           loop: true,
//         }}
//         className="absolute inset-0"
//       >
//         <CarouselContent>
//           {images.map((url: string, index: number) => (
//             <CarouselItem
//               key={index}
//               className="before:bg-neutral-darker/50 relative min-h-[calc(100svh-80px)] w-full before:absolute before:inset-0 before:z-1 sm:min-h-[calc(100svh-96px)]"
//             >
//               <Image
//                 src={`${process.env.NEXT_PUBLIC_STATIC_URL}/${url}`}
//                 alt={`Hero Image ${index + 1}`}
//                 fill
//                 className="object-cover"
//                 priority={index === 0}
//               />
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//       </Carousel>
//       <div className="content-wrapper">
//         <div className="relative z-1 flex h-full flex-col gap-10 text-center text-white">
//           <h1 className="text-5xl font-semibold sm:text-7xl lg:text-8xl">Taste of Nepal</h1>
//           <div className="mx-auto flex max-w-[672px] flex-col items-center justify-center gap-6">
//             <p className="px-2 text-lg font-extralight sm:text-2xl">
//               From spicy noodles to Himalayan teas, explore the authentic flavors of Nepal -
//               Delivered fresh across the UK
//             </p>
//             <div className="flex gap-4">
//               <Button variant="primary" text="Shop Now" href="/products" className="!px-6 !py-4" />
//               <Button
//                 variant="outline"
//                 text="About Us"
//                 href="/about"
//                 className="text-neutral-light !px-6 !py-4"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;
