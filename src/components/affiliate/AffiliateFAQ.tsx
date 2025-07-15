import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Search, Mail, MessageCircle } from 'lucide-react';
import { useAffiliate } from '@/hooks/useAffiliate';

const AffiliateFAQ = () => {
  const { settings } = useAffiliate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // FAQ items
  const faqItems = [
    {
      question: "How does the affiliate program work?",
      answer: "Our affiliate program allows you to earn commission for every purchase made through your unique referral link. When someone clicks your link and makes a purchase, you earn a percentage of their order value. The current commission rate is " + (settings?.defaultCommissionRate || 5) + "%."
    },
    {
      question: "How do I get my affiliate link?",
      answer: "Your unique affiliate link is automatically generated when you join the program. You can find it in the 'Your Affiliate Link' section of the dashboard. You can copy this link and share it with friends, family, or on social media."
    },
    {
      question: "When will I receive my commission?",
      answer: "Commissions are first marked as 'pending' until the order is confirmed and processed. Once approved, they become available for payout. You can request a payout when your available commission reaches the minimum threshold of ¥" + (settings?.minPayoutAmount || 5000) + "."
    },
    {
      question: "What is the minimum payout amount?",
      answer: "The minimum amount required for a payout is ¥" + (settings?.minPayoutAmount || 5000) + ". Once your available commission reaches this amount, you can request a payout through your dashboard."
    },
    {
      question: "How do I request a payout?",
      answer: "When your available commission reaches the minimum threshold, you can request a payout through the 'Request Payout' section of your dashboard. You'll need to provide your bank information for the transfer."
    },
    {
      question: "What payment methods are available for payouts?",
      answer: "We currently support the following payment methods: " + (settings?.payoutMethods?.join(", ") || "Bank Transfer") + ". You can select your preferred method when requesting a payout."
    },
    {
      question: "How long does it take to process a payout?",
      answer: "Payout requests are typically processed within 3-5 business days. Once processed, it may take an additional 1-3 business days for the funds to appear in your account, depending on your bank."
    },
    {
      question: "Can I see who clicked on my link?",
      answer: "Yes, you can see anonymized data about who clicked your link in the 'Referrals' tab. For privacy reasons, we don't show personal information until someone registers or makes a purchase."
    },
    {
      question: "What happens if someone clicks my link but purchases later?",
      answer: "We use cookies to track referrals for up to 30 days. If someone clicks your link and makes a purchase within 30 days, you'll still receive the commission even if they didn't buy immediately."
    },
    {
      question: "Can I use my own affiliate code for purchases?",
      answer: "No, you cannot use your own affiliate code for your personal purchases. This is to prevent abuse of the affiliate program."
    }
  ];
  
  // Filter FAQ items based on search term
  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center text-xl">
          <HelpCircle className="w-5 h-5 mr-2 text-primary" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No matching questions</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try a different search term or contact support for assistance
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Still have questions?</h3>
          <p className="text-blue-700 mb-4">
            If you couldn't find the answer to your question, feel free to contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Us
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateFAQ;