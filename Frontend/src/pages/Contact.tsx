import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubmitContactMutation } from "@/store/api/contactApi";
import { isValidEmail, isValidName, isValidPhone, normalizeEmail, normalizeWhitespace, sanitizeNameInput, sanitizePhoneInput } from "@/lib/validation";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Preeti+Nagar,+Raheem+Nagar,+Dudauli,+Sitapur+Rd,+Lucknow,+Uttar+Pradesh+226021";

const contactInfo = [
  { icon: Mail, label: "Email", value: "info@maurmart.com", href: "mailto:info@maurmart.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, label: "Address", value: "Preeti Nagar, Raheem Nagar, Dudauli, Sitapur Rd, Lucknow, Uttar Pradesh 226021", href: MAPS_URL },
  { icon: Clock, label: "Working Hours", value: "Mon–Sat, 9 AM – 8 PM IST", href: null },
];

const Contact = () => {
  const { toast } = useToast();
  const [submitContact, { isLoading }] = useSubmitContactMutation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      const sanitizedName = sanitizeNameInput(value);
      setForm((prev) => ({ ...prev, name: sanitizedName }));
      return;
    }

    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: sanitizePhoneInput(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = normalizeWhitespace(form.name);
    const trimmedEmail = normalizeEmail(form.email);
    const trimmedPhone = form.phone.trim();
    const trimmedSubject = form.subject.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedMessage) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (!isValidName(trimmedName)) {
      toast({ title: "Name should contain only letters", variant: "destructive" });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      toast({ title: "Enter a valid 10-digit mobile number starting with 6 to 9", variant: "destructive" });
      return;
    }
    
    try {
      await submitContact({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        subject: trimmedSubject,
        message: trimmedMessage,
      }).unwrap();
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      toast({ 
        title: "Failed to send message", 
        description: error?.data?.message || error?.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient py-8 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(160_50%_40%/0.3),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
            Have a question, feedback, or need help? We're here for you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-card rounded-xl p-6 border border-border card-shadow text-center">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{label}</h3>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-14 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Form */}
            <div className="bg-card rounded-2xl p-8 border border-border card-shadow">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Send Us a Message</h2>
              <p className="text-sm text-muted-foreground mb-6">Fill out the form and we'll respond within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" placeholder="Aman Verma" value={form.name} onChange={handleChange} maxLength={100} autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" placeholder="aman.verma@example.com" value={form.email} onChange={handleChange} maxLength={255} autoComplete="email" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                    <p className="text-xs text-muted-foreground">10 digits only, starting with 6 to 9.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="Order issue, delivery query, product feedback" value={form.subject} onChange={handleChange} maxLength={200} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" name="message" placeholder="Share your issue or question with order details if relevant." rows={5} value={form.message} onChange={handleChange} maxLength={1000} />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? "Sending…" : <><Send className="h-4 w-4 mr-1" /> Send Message</>}
                </Button>
              </form>
            </div>

            {/* Map / Illustration side */}
            <div className="flex flex-col justify-center">
              <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
                <iframe
                  title="MaurMart Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.853142490508!2d80.9246397!3d26.9081555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3999571ca77c6e49%3A0x5203b7b6c67f57a0!2sMaurMart!5e0!3m2!1sen!2sin!4v1774085605330!5m2!1sen!2sin"
                  className="w-full h-64 md:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                />
              </div>
              <div className="mt-6 bg-card rounded-xl p-6 border border-border card-shadow">
                <h3 className="font-semibold text-foreground mb-2">Frequently Asked</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Response time: Within 24 hours</li>
                  <li>Order issues? Include your order ID for faster help</li>
                  <li>Live chat coming soon!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
