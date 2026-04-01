import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Sparkles } from "lucide-react";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  time: Date;
}

const QUICK_TOPICS = [
  { label: "How to place an order?", key: "order" },
  { label: "Apply a coupon code", key: "coupon" },
  { label: "Track my order", key: "track" },
  { label: "Product categories", key: "categories" },
  { label: "Wholesale discounts", key: "discount" },
  { label: "How to register?", key: "register" },
];

function matchResponse(input: string): string {
  const q = input.toLowerCase().trim();

  if (/\b(hi|hello|hey|namaste|helo|hii)\b/.test(q)) {
    return "Hello! Welcome to Vendorkart — India's #1 B2B Wholesale Marketplace. I'm your shopping assistant. How can I help you today? You can ask me about products, ordering, coupons, discounts, or anything else!";
  }

  if (/\b(register|sign.?up|create account|new account|join)\b/.test(q)) {
    return "To register on Vendorkart:\n\n1. Click the **Sign Up** button on the home page or login page.\n2. Enter your name, email, and a strong password.\n3. Submit the form — you'll be logged in right away!\n\nWe support both **Customer** (buyer) and **Vendor** (seller) accounts. Customers can buy in bulk; vendors can list and manage their products.";
  }

  if (/\b(login|log in|sign in|signin|access account)\b/.test(q)) {
    return "To log in:\n\n1. Click **Login** at the top-right of the page.\n2. Enter your registered email and password.\n3. Hit **Sign In** — you'll land on your dashboard.\n\n**Forgot password?** Use the reset option on the login page.";
  }

  if (/\b(coupon|promo|discount code|voucher|apply code|promo code)\b/.test(q)) {
    return "To apply a coupon discount:\n\n1. Add items to your **Cart**.\n2. In the Order Summary panel, you'll see a **\"Have a coupon?\"** section.\n3. Type your coupon code and click **Apply**.\n4. The discount will be instantly calculated and shown!\n\nCoupon discounts are applied on top of any existing wholesale discounts. Multiple coupon types exist:\n• **Percentage** (e.g. 20% off)\n• **Fixed amount** (e.g. ₹500 off)";
  }

  if (/\b(track|tracking|where.*order|order status|shipment)\b/.test(q)) {
    return "To track your order:\n\n1. Go to your **Customer Dashboard → My Orders**.\n2. You'll see all orders organised by status: Active, Completed, Cancelled.\n3. Click **Details** on any order to see a live tracking bar:\n   Confirmed → Processing → Shipped → Delivered\n\nYou'll also see the shipping address, item breakdown, and a download link for your invoice.";
  }

  if (/\b(order|buy|purchase|checkout|place order|how to order)\b/.test(q)) {
    return "Here's how to place an order on Vendorkart:\n\n1. **Browse** products from the catalog or search by name/category.\n2. Click **Add to Cart** on any product — set the quantity (MOQ applies).\n3. Go to your **Cart** from the top navigation.\n4. Select or add a **Shipping Address**.\n5. Optionally apply a **Coupon Code** for additional discounts.\n6. Click **Proceed to Payment** and complete the UPI/QR payment.\n7. Upload your **payment screenshot** as proof.\n8. Admin will verify and confirm your order!";
  }

  if (/\b(product|category|categories|what.*sell|what.*available|catalog)\b/.test(q)) {
    return "Vendorkart offers a wide range of B2B wholesale products across categories like:\n\n• Electronics & Accessories\n• Clothing & Apparel\n• Home & Kitchen\n• Beauty & Personal Care\n• Industrial Supplies\n• Agricultural Products\n• Office Stationery & More\n\nUse the **Products** page to browse all categories or search by name. You can also visit individual **Vendor Stores** to see their full catalog!";
  }

  if (/\b(search|find product|look for|filter)\b/.test(q)) {
    return "Finding products on Vendorkart is easy:\n\n1. Use the **Search bar** at the top of the Products page.\n2. Filter by **category**, **price range**, or **vendor**.\n3. Sort by **Newest**, **Price Low-High**, or **Best Rating**.\n4. Click any product to see full details, images, MOQ, and bulk pricing.\n\nYou can also browse **Vendor Stores** directly from the Vendors page!";
  }

  if (/\b(discount|wholesale|bulk|volume|pricing|bulk price)\b/.test(q)) {
    return "Vendorkart offers **automatic wholesale discounts** based on your cart value:\n\n• Cart ₹10,000+ → **2% off**\n• Cart ₹50,000+ → **5% off**\n• Cart ₹2,00,000+ → **8% off**\n• Cart ₹5,00,000+ → **12% off**\n\nThese are applied automatically at checkout! You can also use **Coupon Codes** for additional savings on top of wholesale discounts.";
  }

  if (/\b(invoice|bill|receipt|download invoice)\b/.test(q)) {
    return "To download your invoice:\n\n1. Go to **My Orders** in your Customer Dashboard.\n2. Find the order you need.\n3. Click the **Invoice** button on that order card.\n4. A print-ready invoice will open in a new window — you can print or save it as PDF!\n\nAll invoices include itemised details, discounts, GST breakdown, and your shipping address.";
  }

  if (/\b(payment|pay|upi|qr|razorpay|gpay|phonepe|paytm)\b/.test(q)) {
    return "Vendorkart uses a **UPI QR code payment** system:\n\n1. After checkout, you'll see a **QR code** to scan with any UPI app (GPay, PhonePe, Paytm, BHIM, etc.).\n2. You can also pay via the **Razorpay link** provided.\n3. After payment, **upload a screenshot** as proof.\n4. Our admin team will verify and confirm your order!\n\nPayments are secure and processed instantly.";
  }

  if (/\b(address|shipping address|delivery address|add address)\b/.test(q)) {
    return "To manage your shipping addresses:\n\n1. Go to **Customer Dashboard → Address Book**.\n2. Click **Add New Address** and fill in your details.\n3. Mark an address as **Default** to auto-select it at checkout.\n4. You can have multiple addresses saved!\n\nAt checkout, you can switch between saved addresses with one click.";
  }

  if (/\b(vendor|seller|become vendor|sell|register as vendor|vendor account)\b/.test(q)) {
    return "To become a vendor on Vendorkart:\n\n1. **Register** a new account and select **Vendor** role.\n2. Set up your **Vendor Store** — add your business name, logo, and description.\n3. Choose a **Subscription Plan** that suits your scale.\n4. Start **listing products** with images, pricing, and MOQ.\n5. Manage orders, track payments, and grow your B2B business!\n\nVendors get a dedicated store page, analytics dashboard, and direct access to thousands of buyers.";
  }

  if (/\b(moq|minimum order|min order|minimum quantity)\b/.test(q)) {
    return "**MOQ (Minimum Order Quantity)** is the minimum number of units a vendor requires per order.\n\nFor example, if a product has MOQ of 10, you must order at least 10 units.\n\nYou'll see the MOQ clearly displayed on:\n• The product detail page\n• In your cart (with a warning if you're below MOQ)\n\nMOQ is set by individual vendors to support wholesale bulk purchasing.";
  }

  if (/\b(support|help|contact|issue|problem|complaint|customer service)\b/.test(q)) {
    return "Need help? Here's how to reach us:\n\n1. Go to **Customer Dashboard → Support** to raise a ticket.\n2. Describe your issue and our team will respond promptly.\n\nYou can also email us at **support@vendorkart.in** or use the **Contact** page on the website.\n\nFor urgent payment issues, include your Order Number for faster resolution!";
  }

  if (/\b(wishlist|save|saved items|favourite|favorite)\b/.test(q)) {
    return "You can save products to your **Wishlist**:\n\n1. Click the **heart icon** on any product to save it.\n2. View all saved items in **My Dashboard → Wishlist**.\n3. Move items from wishlist to cart when you're ready to order!\n\nYour wishlist helps you track B2B products you're interested in before making a bulk purchase decision.";
  }

  if (/\b(cancel|cancell|return|refund)\b/.test(q)) {
    return "For **order cancellations or returns**:\n\n1. Go to **My Orders** and find the relevant order.\n2. Contact our support team via **Customer Support** with your order number.\n3. Our team will review and process the cancellation/return.\n\nNote: Orders already shipped may not be cancellable. Refunds are processed within 5–7 business days after approval.";
  }

  if (/\b(notification|notif|alert|update)\b/.test(q)) {
    return "Stay updated on your orders:\n\n• Visit **Notifications** in your dashboard for real-time alerts.\n• Get notified when your order is confirmed, shipped, or delivered.\n• Vendor notifications include new orders and payment updates.\n\nYou'll never miss an important update on Vendorkart!";
  }

  if (/\b(subscription|plan|vendor plan|upgrade)\b/.test(q)) {
    return "Vendors on Vendorkart can choose from multiple **Subscription Plans**:\n\n• **Basic** — List limited products, standard features\n• **Pro** — More products, banner uploads, priority listing\n• **Business** — Unlimited products, featured store, analytics\n\nUpgrade your plan from **Vendor Dashboard → Subscription**. Higher plans give you more visibility and buyer reach!";
  }

  if (/\b(gsm|gst|tax|cgst|sgst|igst)\b/.test(q)) {
    return "Vendorkart applies **18% GST** on all orders as per Indian tax regulations.\n\nYour invoice includes:\n• Base product subtotal\n• Wholesale / coupon discount\n• GST (18%) on discounted amount\n• Final total payable\n\nDownload your invoice from **My Orders** for complete GST details suitable for business accounting.";
  }

  if (/\b(thank|thanks|great|awesome|good|nice|helpful|perfect)\b/.test(q)) {
    return "You're welcome! It's great to hear that. If you have any more questions about Vendorkart, ordering, products, or anything else — I'm right here. Happy shopping! 🛒";
  }

  if (/\b(bye|goodbye|ok bye|that.?s all|done|exit)\b/.test(q)) {
    return "Thanks for chatting! Come back anytime if you need help. Happy shopping on Vendorkart! 👋";
  }

  return `I'm not sure I fully understood that, but I'm here to help! Here are some things I can assist with:\n\n• How to register or login\n• Browsing and searching products\n• Placing bulk orders\n• Applying coupon codes\n• Tracking orders & invoices\n• Wholesale discount tiers\n• Vendor registration & setup\n\nFeel free to ask anything, or pick a topic from the quick buttons below!`;
}

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "Hi there! 👋 I'm Vendorkart's smart assistant. I can help you with:\n\n• Placing bulk orders\n• Applying coupon codes\n• Tracking shipments\n• Product & pricing info\n• Vendor & buyer guides\n\nWhat would you like to know?",
  time: new Date(),
};

let _id = 1;
function nextId() { return _id++; }

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addBotMessage = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const msg: Message = { id: nextId(), from: "bot", text, time: new Date() };
      setMessages(p => [...p, msg]);
      if (!open) setUnread(u => u + 1);
    }, 700 + Math.random() * 600);
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    const userMsg: Message = { id: nextId(), from: "user", text: q, time: new Date() };
    setMessages(p => [...p, userMsg]);
    addBotMessage(matchResponse(q));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
        {/* WhatsApp button */}
        {!open && (
          <a
            href="https://wa.me/918927621385"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105 transition-all flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}

        {/* Chatbot button */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 transition-all flex items-center justify-center group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unread}
              </span>
            )}
          </button>
        )}

        {/* Chat panel */}
        {open && (
          <div className="w-[370px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Vendorkart Assistant</p>
                <p className="text-[11px] text-white/70 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />Smart guide · Always online</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50 scroll-smooth">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/30">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.from === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-white/8"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                    <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-white/60" : "text-gray-400 dark:text-gray-500"}`}>
                      {msg.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.from === "user" && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick topics */}
            <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/8 flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_TOPICS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => send(t.label)}
                    className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/8 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything…"
                className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-indigo-300 dark:focus:border-indigo-500 transition-colors placeholder:text-gray-400"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-indigo-500/30 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
