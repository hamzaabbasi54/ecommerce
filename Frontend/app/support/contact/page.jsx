"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2 text-foreground">Contact Us</h1>
      <p className="text-muted-foreground mb-12">We'd love to hear from you. Please fill out this form or get in touch using the information below.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-foreground">Send us a message</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent! (Mock)"); }}>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Your Name" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea placeholder="How can we help?" rows={5} required />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@electronica.com</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-4 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <span>123 Technology Drive<br/>Silicon Valley, CA 94025<br/>United States</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
