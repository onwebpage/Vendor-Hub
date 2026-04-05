import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "bn";

export interface Translations {
  nav: {
    home: string;
    categories: string;
    allVendors: string;
    productListing: string;
    productDetails: string;
    pricing: string;
    aboutUs: string;
    contactUs: string;
    searchFilters: string;
    login: string;
    signUp: string;
    dashboard: string;
    logout: string;
    wishlist: string;
    cart: string;
  };
  hero: {
    badge: string;
    headline1: string;
    headline2: string;
    subtext: string;
    buyBtn: string;
    sellBtn: string;
  };
  stats: {
    vendors: string;
    buyers: string;
    tradeVolume: string;
    satisfaction: string;
  };
  home: {
    featuredProducts: string;
    viewAll: string;
    browseCatalog: string;
    trustedBy: string;
    categories: string;
    whyVendorkart: string;
    startBuying: string;
    startSelling: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      categories: "Categories",
      allVendors: "All Vendors",
      productListing: "Product Listing",
      productDetails: "Product Details",
      pricing: "Pricing",
      aboutUs: "About Us",
      contactUs: "Contact Us",
      searchFilters: "Search + Filters",
      login: "Log In",
      signUp: "Sign Up",
      dashboard: "Dashboard",
      logout: "Log out",
      wishlist: "Wishlist",
      cart: "Cart",
    },
    hero: {
      badge: "India's #1 B2B Wholesale Marketplace",
      headline1: "Smarter B2B Sourcing,",
      headline2: "Built for India.",
      subtext:
        "Connect directly with verified manufacturers, distributors, and bulk suppliers across all 28 states. Escrow payments, competitive pricing, real-time logistics — all in one platform.",
      buyBtn: "Start Buying Free",
      sellBtn: "Sell on Vendorkart",
    },
    stats: {
      vendors: "Verified Vendors",
      buyers: "B2B Buyers",
      tradeVolume: "Trade Volume",
      satisfaction: "Satisfaction Rate",
    },
    home: {
      featuredProducts: "Featured Products",
      viewAll: "View All",
      browseCatalog: "Browse Full Catalog",
      trustedBy: "Trusted by India's Top Businesses",
      categories: "Shop by Category",
      whyVendorkart: "Why Vendorkart?",
      startBuying: "Start Buying",
      startSelling: "Start Selling",
    },
  },
  hi: {
    nav: {
      home: "होम",
      categories: "श्रेणियाँ",
      allVendors: "सभी विक्रेता",
      productListing: "उत्पाद सूची",
      productDetails: "उत्पाद विवरण",
      pricing: "मूल्य निर्धारण",
      aboutUs: "हमारे बारे में",
      contactUs: "संपर्क करें",
      searchFilters: "खोज + फ़िल्टर",
      login: "लॉग इन",
      signUp: "साइन अप",
      dashboard: "डैशबोर्ड",
      logout: "लॉग आउट",
      wishlist: "विशलिस्ट",
      cart: "कार्ट",
    },
    hero: {
      badge: "भारत का नंबर 1 B2B थोक बाज़ार",
      headline1: "स्मार्टर B2B सोर्सिंग,",
      headline2: "भारत के लिए।",
      subtext:
        "सत्यापित निर्माताओं, वितरकों और थोक आपूर्तिकर्ताओं से सीधे जुड़ें — सभी 28 राज्यों में। एस्क्रो भुगतान, प्रतिस्पर्धी मूल्य, रियल-टाइम लॉजिस्टिक्स — सब एक प्लेटफ़ॉर्म पर।",
      buyBtn: "मुफ़्त खरीदना शुरू करें",
      sellBtn: "Vendorkart पर बेचें",
    },
    stats: {
      vendors: "सत्यापित विक्रेता",
      buyers: "B2B खरीदार",
      tradeVolume: "व्यापार मात्रा",
      satisfaction: "संतुष्टि दर",
    },
    home: {
      featuredProducts: "विशेष उत्पाद",
      viewAll: "सभी देखें",
      browseCatalog: "पूरी सूची देखें",
      trustedBy: "भारत के शीर्ष व्यवसायों का भरोसा",
      categories: "श्रेणी के अनुसार खरीदें",
      whyVendorkart: "Vendorkart क्यों?",
      startBuying: "खरीदना शुरू करें",
      startSelling: "बेचना शुरू करें",
    },
  },
  bn: {
    nav: {
      home: "হোম",
      categories: "বিভাগ",
      allVendors: "সকল বিক্রেতা",
      productListing: "পণ্য তালিকা",
      productDetails: "পণ্যের বিবরণ",
      pricing: "মূল্য পরিকল্পনা",
      aboutUs: "আমাদের সম্পর্কে",
      contactUs: "যোগাযোগ করুন",
      searchFilters: "অনুসন্ধান + ফিল্টার",
      login: "লগ ইন",
      signUp: "নিবন্ধন",
      dashboard: "ড্যাশবোর্ড",
      logout: "লগ আউট",
      wishlist: "উইশলিস্ট",
      cart: "কার্ট",
    },
    hero: {
      badge: "ভারতের #১ B2B পাইকারি মার্কেটপ্লেস",
      headline1: "স্মার্টার B2B সোর্সিং,",
      headline2: "ভারতের জন্য তৈরি।",
      subtext:
        "সমস্ত ২৮টি রাজ্যে যাচাইকৃত নির্মাতা, পরিবেশক এবং পাইকারি সরবরাহকারীদের সাথে সরাসরি সংযুক্ত হন। এস্ক্রো পেমেন্ট, প্রতিযোগিতামূলক মূল্য, রিয়েল-টাইম লজিস্টিক্স — সব এক প্ল্যাটফর্মে।",
      buyBtn: "বিনামূল্যে কেনা শুরু করুন",
      sellBtn: "Vendorkart-এ বিক্রয় করুন",
    },
    stats: {
      vendors: "যাচাইকৃত বিক্রেতা",
      buyers: "B2B ক্রেতা",
      tradeVolume: "বাণিজ্য পরিমাণ",
      satisfaction: "সন্তুষ্টির হার",
    },
    home: {
      featuredProducts: "বিশেষ পণ্যসমূহ",
      viewAll: "সব দেখুন",
      browseCatalog: "সম্পূর্ণ তালিকা দেখুন",
      trustedBy: "ভারতের শীর্ষ ব্যবসাগুলোর বিশ্বাস",
      categories: "বিভাগ অনুযায়ী কেনাকাটা",
      whyVendorkart: "কেন Vendorkart?",
      startBuying: "কেনা শুরু করুন",
      startSelling: "বিক্রয় শুরু করুন",
    },
  },
};

const STORAGE_KEY = "vendorkart_language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored && ["en", "hi", "bn"].includes(stored) ? stored : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export const LANGUAGE_OPTIONS: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: "en", label: "English",  nativeLabel: "English", flag: "🇮🇳" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिन्दी",   flag: "🇮🇳" },
  { code: "bn", label: "Bengali",  nativeLabel: "বাংলা",    flag: "🇮🇳" },
];
