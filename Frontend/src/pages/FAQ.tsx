import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetFAQsQuery } from "@/store/api/faqApi";

const FAQ = () => {
  const { data: allFaqs = [], isLoading } = useGetFAQsQuery({});
  const [searchTerm, setSearchTerm] = useState("");

  // Group FAQs by category and filter by search term
  const groupedFaqs = useMemo(() => {
    const filtered = allFaqs.filter(
      (faq: any) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc: Record<string, any[]>, faq: any) => {
      const category = faq.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    }, {});
  }, [allFaqs, searchTerm]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          Frequently Asked <span className="text-primary">Questions</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          Everything you need to know about shopping at MaurMart. Can't find the answer? Contact our support team.
        </p>

        <div className="relative group max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 pr-4 rounded-2xl bg-accent/30 border-border/40 focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {Object.keys(groupedFaqs).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No FAQs found matching your search.</p>
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([category, faqs]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </div>
                {category}
              </h3>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {(faqs as any[]).map((faq, idx) => (
                  <AccordionItem 
                    key={faq._id} 
                    value={`item-${faq._id}`}
                    className="bg-card border border-border/40 rounded-2xl px-6 transition-all data-[state=open]:card-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline hover:text-primary text-left py-6 font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </div>

      <div className="mt-20 p-8 rounded-[2rem] bg-foreground text-primary-foreground text-center">
        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
        <p className="text-primary-foreground/60 mb-8">We're here to help you 24/7. Reach out to us through any of our channels.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 h-12 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all">
            Contact Support
          </button>
          <button className="px-8 h-12 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all">
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
