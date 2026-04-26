import React, { createContext, useContext, useState, useEffect } from "react";
import { autoTranslator } from "./auto-translate";

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
  trustPills: {
    gstVerified: string;
    escrow: string;
    zeroCommission: string;
    freeToJoin: string;
  };
  stats: {
    vendors: string;
    buyers: string;
    tradeVolume: string;
    satisfaction: string;
  };
  dashboard: {
    liveMarketplace: string;
    live: string;
    activeOrders: string;
    tradeVolume: string;
    verifiedVendors: string;
    satisfaction: string;
    excellent: string;
    monthlyGMV: string;
    newOrder: string;
    escrowProtected: string;
    gstVerified: string;
    suppliers: string;
    quoteReady: string;
    vendorsMatched: string;
    ago: string;
  };
  trusted: {
    label: string;
  };
  categories: {
    browseByIndustry: string;
    exploreTop: string;
    wholesaleCategories: string;
    viewAll: string;
    mostPopular: string;
    topSeller: string;
    explore: string;
    products: string;
    names: string[];
  };
  products: {
    trendingNow: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    catalogLoading: string;
    catalogSubtext: string;
  };
  features: {
    sectionLabel: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    gstTitle: string;
    gstStat: string;
    gstDesc: string;
    gstTag1: string;
    gstTag2: string;
    gstTag3: string;
    escrowTitle: string;
    escrowDesc: string;
    buyingFeeLabel: string;
    disputeLabel: string;
    smallCards: Array<{ title: string; desc: string; stat: string }>;
  };
  testimonials: {
    sectionLabel: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    rating: string;
    texts: string[];
  };
  cta: {
    forBuyers: string;
    buyerHeadline: string;
    buyerDesc: string;
    buyerBtn: string;
    forVendors: string;
    vendorHeadline: string;
    vendorDesc: string;
    vendorBtn: string;
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
    trustPills: {
      gstVerified: "GST-Verified Suppliers",
      escrow: "Escrow Payments",
      zeroCommission: "Zero Commission",
      freeToJoin: "Free to Join",
    },
    stats: {
      vendors: "Verified Vendors",
      buyers: "B2B Buyers",
      tradeVolume: "Trade Volume",
      satisfaction: "Satisfaction Rate",
    },
    dashboard: {
      liveMarketplace: "Live Marketplace",
      live: "Live",
      activeOrders: "Active Orders",
      tradeVolume: "Trade Volume",
      verifiedVendors: "Verified Vendors",
      satisfaction: "Satisfaction",
      excellent: "Excellent",
      monthlyGMV: "Monthly GMV — FY 2025",
      newOrder: "New Order",
      escrowProtected: "Escrow Protected",
      gstVerified: "GST Verified",
      suppliers: "Suppliers",
      quoteReady: "Quote Ready",
      vendorsMatched: "vendors matched",
      ago: "ago",
    },
    trusted: {
      label: "Trusted by",
    },
    categories: {
      browseByIndustry: "Browse by Industry",
      exploreTop: "Explore Top",
      wholesaleCategories: "Wholesale Categories",
      viewAll: "View All Categories",
      mostPopular: "Most Popular",
      topSeller: "Top Seller",
      explore: "Explore",
      products: "products",
      names: [
        "Electronics & Tech",
        "Industrial Machinery",
        "Fashion & Apparel",
        "Agriculture & Farm",
        "Medical & Pharma",
        "Home & Decor",
        "Automotive Parts",
        "Food & Beverages",
      ],
    },
    products: {
      trendingNow: "Trending Now",
      headline1: "Bulk Products",
      headline2: "Ready to Order",
      subtitle: "High-demand items from verified suppliers. MOQ-friendly, competitively priced.",
      catalogLoading: "Catalog Loading Soon",
      catalogSubtext: "Vendors are adding products. Check back shortly.",
    },
    features: {
      sectionLabel: "Why Vendorkart",
      headline1: "Built for B2B.",
      headline2: "Engineered for Scale.",
      subtitle: "Every feature built ground-up for wholesale sourcing, vendor management, and enterprise-grade trading.",
      gstTitle: "GST-Verified Businesses Only",
      gstStat: "Vendors Verified",
      gstDesc: "Every vendor and buyer undergoes strict GST, PAN, and business registration verification. Our trust engine runs continuous compliance checks — zero tolerance for fraud.",
      gstTag1: "GST Verified",
      gstTag2: "PAN Checked",
      gstTag3: "MCA Verified",
      escrowTitle: "Escrow Payment Protection",
      escrowDesc: "Funds are held securely until delivery is confirmed by the buyer. Zero risk — always. Fully automated dispute resolution.",
      buyingFeeLabel: "Buying Fee",
      disputeLabel: "Dispute SLA",
      smallCards: [
        {
          title: "Pan-India Network",
          desc: "Verified suppliers across all 28 states. Doorstep delivery nationwide.",
          stat: "28 States",
        },
        {
          title: "Instant Quote Matching",
          desc: "Smart engine matches your bulk requirements to the best suppliers in seconds.",
          stat: "<30 sec",
        },
        {
          title: "Live Analytics",
          desc: "Real-time order tracking, revenue analytics, and procurement insights.",
          stat: "Real-time",
        },
      ],
    },
    testimonials: {
      sectionLabel: "Customer Stories",
      headline1: "Loved by",
      headline2: "Businesses",
      subtitle: "Real businesses. Real savings. Real growth — powered by Vendorkart.",
      rating: "average rating",
      texts: [
        "Vendorkart transformed how we source industrial components. We cut procurement costs by 32% in just 3 months.",
        "We scaled from 3 vendors to 28 verified suppliers. The bulk pricing tool alone saved us ₹14L last quarter.",
        "The MOQ feature is a game-changer. We negotiate directly with manufacturers and compare bulk quotes side-by-side.",
        "Every vendor is GST-verified and background-checked. It's become our #1 sourcing channel for medical equipment.",
        "We crossed ₹50L in sales within 6 months. Orders came from 12 different states. Incredible reach.",
        "Real-time order tracking and escrow payments give us total control. Disputes resolved within 24 hours.",
        "Vendorkart's escrow system gave me confidence placing large orders. Now we do ₹20L+ monthly through the platform.",
        "10+ verified quotes in hours — what used to take weeks. The vendor subscription is absolutely worth every rupee.",
      ],
    },
    cta: {
      forBuyers: "For Buyers",
      buyerHeadline: "Source smarter.\nSpend less.",
      buyerDesc: "Access 12,000+ verified suppliers, compare bulk quotes, and place orders with full escrow protection — all for free.",
      buyerBtn: "Create Free Buyer Account",
      forVendors: "For Vendors",
      vendorHeadline: "Grow your B2B\nsales 10x.",
      vendorDesc: "Reach 2.4 lakh+ business buyers across India. List products, manage orders, and grow revenue — starting at just ₹999/mo.",
      vendorBtn: "Start Selling Today",
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
    trustPills: {
      gstVerified: "GST-सत्यापित आपूर्तिकर्ता",
      escrow: "एस्क्रो भुगतान",
      zeroCommission: "शून्य कमीशन",
      freeToJoin: "मुफ़्त में जुड़ें",
    },
    stats: {
      vendors: "सत्यापित विक्रेता",
      buyers: "B2B खरीदार",
      tradeVolume: "व्यापार मात्रा",
      satisfaction: "संतुष्टि दर",
    },
    dashboard: {
      liveMarketplace: "लाइव मार्केटप्लेस",
      live: "लाइव",
      activeOrders: "सक्रिय ऑर्डर",
      tradeVolume: "व्यापार मात्रा",
      verifiedVendors: "सत्यापित विक्रेता",
      satisfaction: "संतुष्टि",
      excellent: "उत्कृष्ट",
      monthlyGMV: "मासिक GMV — वित्त वर्ष 2025",
      newOrder: "नया ऑर्डर",
      escrowProtected: "एस्क्रो सुरक्षित",
      gstVerified: "GST सत्यापित",
      suppliers: "आपूर्तिकर्ता",
      quoteReady: "कोटेशन तैयार",
      vendorsMatched: "विक्रेता मिले",
      ago: "पहले",
    },
    trusted: {
      label: "भरोसा करते हैं",
    },
    categories: {
      browseByIndustry: "उद्योग के अनुसार ब्राउज़ करें",
      exploreTop: "शीर्ष",
      wholesaleCategories: "थोक श्रेणियाँ देखें",
      viewAll: "सभी श्रेणियाँ देखें",
      mostPopular: "सबसे लोकप्रिय",
      topSeller: "टॉप सेलर",
      explore: "देखें",
      products: "उत्पाद",
      names: [
        "इलेक्ट्रॉनिक्स और टेक",
        "औद्योगिक मशीनरी",
        "फैशन और परिधान",
        "कृषि और खेती",
        "चिकित्सा और फार्मा",
        "घर और सजावट",
        "ऑटोमोटिव पार्ट्स",
        "खाद्य और पेय",
      ],
    },
    products: {
      trendingNow: "अभी ट्रेंडिंग",
      headline1: "थोक उत्पाद",
      headline2: "ऑर्डर के लिए तैयार",
      subtitle: "सत्यापित आपूर्तिकर्ताओं के उच्च-मांग उत्पाद। MOQ-अनुकूल, प्रतिस्पर्धी कीमत।",
      catalogLoading: "सूची जल्द आ रही है",
      catalogSubtext: "विक्रेता उत्पाद जोड़ रहे हैं। कृपया थोड़ी देर बाद देखें।",
    },
    features: {
      sectionLabel: "Vendorkart क्यों?",
      headline1: "B2B के लिए बनाया।",
      headline2: "स्केल के लिए तैयार।",
      subtitle: "थोक सोर्सिंग, विक्रेता प्रबंधन और एंटरप्राइज़-ग्रेड ट्रेडिंग के लिए हर फीचर ग्राउंड-अप से बना।",
      gstTitle: "केवल GST-सत्यापित व्यवसाय",
      gstStat: "विक्रेता सत्यापित",
      gstDesc: "हर विक्रेता और खरीदार कड़े GST, PAN और व्यवसाय पंजीकरण सत्यापन से गुज़रता है। हमारा ट्रस्ट इंजन लगातार अनुपालन जांच करता है — धोखाधड़ी के लिए शून्य सहनशीलता।",
      gstTag1: "GST सत्यापित",
      gstTag2: "PAN जांचा",
      gstTag3: "MCA सत्यापित",
      escrowTitle: "एस्क्रो पेमेंट सुरक्षा",
      escrowDesc: "डिलीवरी की पुष्टि होने तक धनराशि सुरक्षित रखी जाती है। हमेशा जोखिम शून्य। पूरी तरह स्वचालित विवाद समाधान।",
      buyingFeeLabel: "खरीदी शुल्क",
      disputeLabel: "विवाद SLA",
      smallCards: [
        {
          title: "पैन-इंडिया नेटवर्क",
          desc: "28 राज्यों में सत्यापित आपूर्तिकर्ता। देशभर में डोरस्टेप डिलीवरी।",
          stat: "28 राज्य",
        },
        {
          title: "तुरंत कोटेशन मिलान",
          desc: "स्मार्ट इंजन सेकंडों में सर्वश्रेष्ठ आपूर्तिकर्ताओं से थोक मांग का मिलान करता है।",
          stat: "<30 सेकंड",
        },
        {
          title: "लाइव एनालिटिक्स",
          desc: "एक जगह रियल-टाइम ऑर्डर ट्रैकिंग, राजस्व विश्लेषण और खरीद अंतर्दृष्टि।",
          stat: "रियल-टाइम",
        },
      ],
    },
    testimonials: {
      sectionLabel: "ग्राहकों की कहानियाँ",
      headline1: "पसंद करते हैं",
      headline2: "व्यवसाय",
      subtitle: "असली व्यवसाय। असली बचत। असली विकास — Vendorkart द्वारा।",
      rating: "औसत रेटिंग",
      texts: [
        "Vendorkart ने हमारी औद्योगिक कम्पोनेंट सोर्सिंग को बदल दिया। हमने मात्र 3 महीनों में खरीद लागत 32% कम की।",
        "हम 3 विक्रेताओं से 28 सत्यापित आपूर्तिकर्ताओं तक बढ़े। बल्क प्राइसिंग टूल ने अकेले पिछली तिमाही में ₹14L बचाए।",
        "MOQ फीचर गेम-चेंजर है। हम सीधे निर्माताओं से बातचीत करते हैं और बल्क कोटेशन की तुलना करते हैं।",
        "हर विक्रेता GST-सत्यापित और बैकग्राउंड-चेक किया है। यह मेडिकल उपकरण के लिए हमारा नंबर 1 सोर्सिंग चैनल बन गया।",
        "हमने 6 महीनों में ₹50L की बिक्री पार की। 12 अलग राज्यों से ऑर्डर आए। अविश्वसनीय पहुंच।",
        "रियल-टाइम ऑर्डर ट्रैकिंग और एस्क्रो पेमेंट हमें पूरा नियंत्रण देते हैं। विवाद 24 घंटों में सुलझ जाते हैं।",
        "Vendorkart की एस्क्रो प्रणाली ने मुझे बड़े ऑर्डर देने का भरोसा दिया। अब हम प्लेटफ़ॉर्म पर ₹20L+ मासिक करते हैं।",
        "घंटों में 10+ सत्यापित कोटेशन — जो पहले हफ्तों लगते थे। विक्रेता सदस्यता हर रुपए के लायक है।",
      ],
    },
    cta: {
      forBuyers: "खरीदारों के लिए",
      buyerHeadline: "स्मार्ट सोर्सिंग।\nकम खर्च।",
      buyerDesc: "12,000+ सत्यापित आपूर्तिकर्ताओं तक पहुंचें, थोक कोटेशन की तुलना करें, और पूर्ण एस्क्रो सुरक्षा के साथ ऑर्डर करें — बिल्कुल मुफ़्त।",
      buyerBtn: "मुफ़्त बायर अकाउंट बनाएं",
      forVendors: "विक्रेताओं के लिए",
      vendorHeadline: "अपनी B2B बिक्री\n10 गुना बढ़ाएं।",
      vendorDesc: "भारत भर में 2.4 लाख+ बिजनेस खरीदारों तक पहुंचें। उत्पाद सूचीबद्ध करें, ऑर्डर प्रबंधित करें और राजस्व बढ़ाएं — मात्र ₹999/माह से।",
      vendorBtn: "आज बेचना शुरू करें",
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
    trustPills: {
      gstVerified: "GST-যাচাইকৃত সরবরাহকারী",
      escrow: "এস্ক্রো পেমেন্ট",
      zeroCommission: "শূন্য কমিশন",
      freeToJoin: "বিনামূল্যে যোগ দিন",
    },
    stats: {
      vendors: "যাচাইকৃত বিক্রেতা",
      buyers: "B2B ক্রেতা",
      tradeVolume: "বাণিজ্য পরিমাণ",
      satisfaction: "সন্তুষ্টির হার",
    },
    dashboard: {
      liveMarketplace: "লাইভ মার্কেটপ্লেস",
      live: "লাইভ",
      activeOrders: "সক্রিয় অর্ডার",
      tradeVolume: "বাণিজ্য পরিমাণ",
      verifiedVendors: "যাচাইকৃত বিক্রেতা",
      satisfaction: "সন্তুষ্টি",
      excellent: "চমৎকার",
      monthlyGMV: "মাসিক GMV — আর্থিক বছর ২০২৫",
      newOrder: "নতুন অর্ডার",
      escrowProtected: "এস্ক্রো সুরক্ষিত",
      gstVerified: "GST যাচাইকৃত",
      suppliers: "সরবরাহকারী",
      quoteReady: "কোটেশন প্রস্তুত",
      vendorsMatched: "বিক্রেতা পাওয়া গেছে",
      ago: "আগে",
    },
    trusted: {
      label: "বিশ্বাস করে",
    },
    categories: {
      browseByIndustry: "শিল্প অনুযায়ী ব্রাউজ করুন",
      exploreTop: "শীর্ষ",
      wholesaleCategories: "পাইকারি বিভাগগুলো দেখুন",
      viewAll: "সকল বিভাগ দেখুন",
      mostPopular: "সবচেয়ে জনপ্রিয়",
      topSeller: "টপ সেলার",
      explore: "দেখুন",
      products: "পণ্য",
      names: [
        "ইলেকট্রনিক্স ও প্রযুক্তি",
        "শিল্প যন্ত্রপাতি",
        "ফ্যাশন ও পোশাক",
        "কৃষি ও খামার",
        "চিকিৎসা ও ফার্মা",
        "গৃহ ও সাজসজ্জা",
        "গাড়ির যন্ত্রাংশ",
        "খাদ্য ও পানীয়",
      ],
    },
    products: {
      trendingNow: "এখন ট্রেন্ডিং",
      headline1: "পাইকারি পণ্য",
      headline2: "অর্ডার দিতে প্রস্তুত",
      subtitle: "যাচাইকৃত সরবরাহকারীদের উচ্চ-চাহিদার পণ্য। MOQ-বান্ধব, প্রতিযোগিতামূলক মূল্য।",
      catalogLoading: "তালিকা শীঘ্রই আসছে",
      catalogSubtext: "বিক্রেতারা পণ্য যোগ করছে। একটু পরে আবার দেখুন।",
    },
    features: {
      sectionLabel: "কেন Vendorkart?",
      headline1: "B2B-এর জন্য তৈরি।",
      headline2: "স্কেলের জন্য ডিজাইন করা।",
      subtitle: "পাইকারি সোর্সিং, বিক্রেতা ব্যবস্থাপনা এবং এন্টারপ্রাইজ-গ্রেড ট্রেডিংয়ের জন্য সব ফিচার গ্রাউন্ড-আপ থেকে তৈরি।",
      gstTitle: "শুধুমাত্র GST-যাচাইকৃত ব্যবসা",
      gstStat: "বিক্রেতা যাচাই",
      gstDesc: "প্রতিটি বিক্রেতা ও ক্রেতা কঠোর GST, PAN এবং ব্যবসা নিবন্ধন যাচাইয়ের মধ্য দিয়ে যায়। আমাদের ট্রাস্ট ইঞ্জিন ক্রমাগত সম্মতি পরীক্ষা চালায় — প্রতারণার শূন্য সহনশীলতা।",
      gstTag1: "GST যাচাইকৃত",
      gstTag2: "PAN যাচাই",
      gstTag3: "MCA যাচাইকৃত",
      escrowTitle: "এস্ক্রো পেমেন্ট সুরক্ষা",
      escrowDesc: "ক্রেতা ডেলিভারি নিশ্চিত না করা পর্যন্ত তহবিল নিরাপদে রাখা হয়। সর্বদা ঝুঁকি শূন্য। সম্পূর্ণ স্বয়ংক্রিয় বিরোধ নিষ্পত্তি।",
      buyingFeeLabel: "ক্রয় ফি",
      disputeLabel: "বিরোধ SLA",
      smallCards: [
        {
          title: "সর্বভারতীয় নেটওয়ার্ক",
          desc: "সব ২৮টি রাজ্যে যাচাইকৃত সরবরাহকারী। সারা দেশে দোরগোড়ায় ডেলিভারি।",
          stat: "২৮ রাজ্য",
        },
        {
          title: "তাৎক্ষণিক কোটেশন মিলান",
          desc: "স্মার্ট ইঞ্জিন সেকেন্ডে আপনার বাল্ক চাহিদার সাথে সেরা সরবরাহকারী মিলিয়ে দেয়।",
          stat: "<৩০ সেকেন্ড",
        },
        {
          title: "লাইভ অ্যানালিটিক্স",
          desc: "এক জায়গায় রিয়েল-টাইম অর্ডার ট্র্যাকিং, রাজস্ব বিশ্লেষণ এবং সংগ্রহ অন্তর্দৃষ্টি।",
          stat: "রিয়েল-টাইম",
        },
      ],
    },
    testimonials: {
      sectionLabel: "গ্রাহকদের গল্প",
      headline1: "পছন্দ করে",
      headline2: "ব্যবসা",
      subtitle: "বাস্তব ব্যবসা। বাস্তব সঞ্চয়। বাস্তব বৃদ্ধি — Vendorkart দ্বারা।",
      rating: "গড় রেটিং",
      texts: [
        "Vendorkart আমাদের শিল্প উপাদান সংগ্রহের পদ্ধতি বদলে দিয়েছে। মাত্র ৩ মাসে সংগ্রহ খরচ ৩২% কমিয়েছি।",
        "আমরা ৩ বিক্রেতা থেকে ২৮ যাচাইকৃত সরবরাহকারীতে বেড়েছি। বাল্ক প্রাইসিং টুল একাই গত ত্রৈমাসিকে ₹১৪L বাঁচিয়েছে।",
        "MOQ ফিচারটি গেম-চেঞ্জার। আমরা সরাসরি নির্মাতাদের সাথে আলোচনা করি এবং বাল্ক কোটেশন পাশাপাশি তুলনা করি।",
        "প্রতিটি বিক্রেতা GST-যাচাইকৃত এবং ব্যাকগ্রাউন্ড-চেক করা। চিকিৎসা সরঞ্জামের জন্য এটি আমাদের ১ নম্বর সোর্সিং চ্যানেল।",
        "৬ মাসে ₹৫০L বিক্রয় অতিক্রম করেছি। ১২টি ভিন্ন রাজ্য থেকে অর্ডার এসেছে। অবিশ্বাস্য বিস্তার।",
        "রিয়েল-টাইম অর্ডার ট্র্যাকিং এবং এস্ক্রো পেমেন্ট আমাদের সম্পূর্ণ নিয়ন্ত্রণ দেয়। ২৪ ঘণ্টার মধ্যে বিরোধ সমাধান।",
        "Vendorkart-এর এস্ক্রো সিস্টেম আমাকে বড় অর্ডার দিতে আত্মবিশ্বাস দিয়েছে। এখন আমরা প্ল্যাটফর্মে মাসে ₹২০L+ করি।",
        "ঘণ্টার মধ্যে ১০+ যাচাইকৃত কোটেশন — যা আগে সপ্তাহ লাগত। বিক্রেতা সদস্যপদ প্রতিটি টাকার মূল্য।",
      ],
    },
    cta: {
      forBuyers: "ক্রেতাদের জন্য",
      buyerHeadline: "স্মার্ট সোর্সিং।\nকম খরচ।",
      buyerDesc: "১২,০০০+ যাচাইকৃত সরবরাহকারী অ্যাক্সেস করুন, বাল্ক কোটেশন তুলনা করুন এবং সম্পূর্ণ এস্ক্রো সুরক্ষায় অর্ডার দিন — সম্পূর্ণ বিনামূল্যে।",
      buyerBtn: "বিনামূল্যে ক্রেতা অ্যাকাউন্ট তৈরি করুন",
      forVendors: "বিক্রেতাদের জন্য",
      vendorHeadline: "আপনার B2B বিক্রয়\n১০ গুণ বাড়ান।",
      vendorDesc: "ভারত জুড়ে ২.৪ লক্ষ+ ব্যবসায়িক ক্রেতাদের কাছে পৌঁছান। পণ্য তালিকা করুন, অর্ডার পরিচালনা করুন এবং আয় বাড়ান — মাত্র ₹৯৯৯/মাস থেকে।",
      vendorBtn: "আজই বিক্রয় শুরু করুন",
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

  useEffect(() => {
    autoTranslator.init();
  }, []);

  useEffect(() => {
    autoTranslator.setLanguage(language);
  }, [language]);

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
