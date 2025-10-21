import { useState } from "react";

const faqSections = [
  {
    title: "General Questions",
    faqs: [
      {
        question: "What services do you offer?",
        answer:
          "We provide home cleaning, office cleaning, deep cleaning, carpet & upholstery cleaning, move-in/move-out cleaning, and specialized sanitization services.",
      },
      {
        question: "Are your cleaners trained and insured?",
        answer:
          "Yes! All our staff are fully trained, background-checked, and insured for your peace of mind.",
      },
      {
        question: "Do I need to provide cleaning supplies?",
        answer:
          "No, we bring all necessary equipment and eco-friendly cleaning products unless you request otherwise.",
      },
    ],
  },
  {
    title: "Booking & Scheduling",
    faqs: [
      {
        question: "How do I book a cleaning service?",
        answer:
          "You can book online through our website, via phone, or by email. Simply select your service, date, and time.",
      },
      {
        question: "Can I schedule recurring cleanings?",
        answer:
          "Absolutely! We offer weekly, biweekly, and monthly cleaning plans tailored to your needs.",
      },
      {
        question: "What if I need to reschedule or cancel?",
        answer:
          "You can reschedule or cancel 24 hours before your appointment without any penalty.",
      },
    ],
  },
  {
    title: "Pricing & Payments",
    faqs: [
      {
        question: "How much does a cleaning service cost?",
        answer:
          "Pricing depends on the service type, property size, and special requests. You can get an instant quote online or contact us for a custom estimate.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept credit/debit cards, mobile payments (Bkash, Rocket), and online payment gateways.",
      },
      {
        question: "Are there extra charges for special requests?",
        answer:
          "Standard cleaning is included in the base price. Deep cleaning, stain removal, or special tasks may incur additional charges.",
      },
    ],
  },
  {
    title: "During & After Cleaning",
    faqs: [
      {
        question: "How long will the cleaning take?",
        answer:
          "It depends on the service type and property size. A standard home cleaning usually takes 2–3 hours.",
      },
      {
        question: "Do I need to be home during cleaning?",
        answer:
          "It’s recommended, but not required. We can arrange access instructions for our trusted staff if you are away.",
      },
      {
        question: "What if something gets damaged during cleaning?",
        answer:
          "Our team is insured, and we take full responsibility for any accidental damages.",
      },
    ],
  },
  {
    title: "Special Services",
    faqs: [
      {
        question: "Do you offer eco-friendly cleaning options?",
        answer:
          "Yes, we use environmentally friendly and non-toxic cleaning products upon request.",
      },
      {
        question: "Can you clean after parties or events?",
        answer:
          "Absolutely! We offer one-time deep cleaning services for post-event cleanup.",
      },
      {
        question: "Do you provide commercial cleaning services?",
        answer:
          "Yes, we handle offices, shops, and commercial spaces with flexible schedules to minimize disruption.",
      },
    ],
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">FAQs</h1>
      <p className="mb-8 text-gray-600">
        
      </p>

      {faqSections.map((section, secIndex) => (
        <div key={secIndex} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">{section.title}</h2>
          <div className="space-y-4">
            {section.faqs.map((faq, index) => {
              const globalIndex = `${secIndex}-${index}`;
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={globalIndex}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFAQ(globalIndex)}
                    className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    <span className="text-gray-600 text-xl">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-96 p-4" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
