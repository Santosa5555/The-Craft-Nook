'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, MapPin, Send, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ContactFormValues) => {
    // TODO: Implement API call later
    console.log('Form data:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    reset();
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'tamangsunnnntos@gmail.com',
      href: 'mailto:tamangsunnnntos@gmail.com',
      color: 'text-primary',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+977 9848856293',
      href: 'tel:+9779848856293',
      color: 'text-secondary',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Kathmandu, Nepal',
      href: '#',
      color: 'text-accent',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Gradient */}
        <div className="from-foreground via-foreground/95 via-primary/5 to-background/90 absolute inset-0 z-0 bg-gradient-to-br" />

        {/* Decorative Orbs */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="bg-primary/10 absolute -top-20 -left-20 h-96 w-96 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -right-20 -bottom-20 h-[32rem] w-[32rem] animate-pulse rounded-full blur-3xl delay-1000" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
          <div className="border-primary/30 bg-background/80 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-foreground mb-6 font-serif text-4xl leading-tight font-bold drop-shadow-lg md:text-5xl lg:text-6xl">
            <span className="block">Let's Connect</span>
            <span className="from-primary via-primary to-secondary block bg-gradient-to-r bg-clip-text text-transparent">
              We'd Love to Hear from You
            </span>
          </h1>
          <p className="text-foreground mx-auto max-w-2xl text-lg leading-relaxed font-medium drop-shadow-md md:text-xl">
            Have a question, feedback, or want to collaborate? Reach out to us and we'll get back to
            you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="relative py-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card
                  key={index}
                  className="group border-primary/20 bg-background/50 hover:border-primary/40 transition-all hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`bg-primary/10 mb-4 inline-flex rounded-lg p-3 ${info.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-foreground mb-2 font-serif text-lg font-semibold">
                      {info.label}
                    </h3>
                    <a
                      href={info.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {info.value}
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="border-border from-primary/5 to-secondary/5 relative border-y bg-gradient-to-br via-transparent py-20">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 font-serif text-3xl font-bold md:text-4xl">
              Send Us a Message
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Fill out the form below and we'll respond to your inquiry as soon as possible.
            </p>
          </div>

          <Card className="border-primary/20 bg-background/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm">{errors.phone.message}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    {...register('subject')}
                    className={errors.subject ? 'border-destructive' : ''}
                  />
                  {errors.subject && (
                    <p className="text-destructive text-sm">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-destructive text-sm">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 w-full bg-gradient-to-r shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="relative py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="text-foreground mb-4 font-serif text-2xl font-bold md:text-3xl">
            Business Hours
          </h2>
          <p className="text-muted-foreground mb-2 text-lg">Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p className="text-muted-foreground text-lg">Saturday: 10:00 AM - 4:00 PM</p>
          <p className="text-muted-foreground mt-4 text-sm">Sunday: Closed</p>
        </div>
      </section>
    </div>
  );
}
