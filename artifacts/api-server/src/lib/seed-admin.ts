import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, legalPagesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger.js";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_EMAIL = "admin@vendorkart.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

const DEFAULT_LEGAL_PAGES = [
  {
    slug: "terms",
    title: "Terms & Conditions",
    subtitle: "Please read these terms carefully before using Vendorkart.",
    content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing or using Vendorkart ("Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform.</p>
<h2>2. Use of Platform</h2>
<p>Vendorkart is a B2B multi-vendor marketplace connecting buyers and verified sellers across India. You agree to use the Platform only for lawful business purposes.</p>
<h2>3. Account Responsibility</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
<h2>4. Vendor Obligations</h2>
<p>Vendors must provide accurate product information, maintain adequate stock, and fulfill orders in a timely manner. Misrepresentation of products or services is strictly prohibited.</p>
<h2>5. Payments & Escrow</h2>
<p>All transactions are processed through our secure escrow payment system. Funds are released to vendors only after order confirmation by the buyer.</p>
<h2>6. Prohibited Activities</h2>
<ul>
<li>Listing counterfeit, illegal, or prohibited goods</li>
<li>Manipulating reviews or ratings</li>
<li>Circumventing platform payment systems</li>
<li>Spamming or harassing other users</li>
</ul>
<h2>7. Intellectual Property</h2>
<p>All content on Vendorkart, including logos, designs, and software, is the property of Vendorkart and protected under applicable intellectual property laws.</p>
<h2>8. Limitation of Liability</h2>
<p>Vendorkart is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
<h2>9. Governing Law</h2>
<p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
<h2>10. Changes to Terms</h2>
<p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "Your privacy matters to us. Learn how we collect and use your data.",
    content: `<h2>1. Information We Collect</h2>
<p>We collect information you provide when registering, placing orders, or contacting support — including name, email, phone number, and business details.</p>
<h2>2. How We Use Your Information</h2>
<ul>
<li>To process orders and facilitate transactions</li>
<li>To send order updates and service notifications</li>
<li>To improve our Platform and user experience</li>
<li>To comply with legal obligations</li>
</ul>
<h2>3. Data Sharing</h2>
<p>We do not sell your personal data. We may share data with trusted service providers (payment processors, logistics partners) solely to operate the Platform.</p>
<h2>4. Cookies</h2>
<p>We use cookies to maintain session state, remember preferences, and analyse Platform usage. You can disable cookies in your browser settings, though some features may be affected.</p>
<h2>5. Data Security</h2>
<p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
<h2>6. Data Retention</h2>
<p>We retain your data for as long as your account is active or as required by law. You may request deletion of your account and associated data at any time.</p>
<h2>7. Your Rights</h2>
<p>You have the right to access, correct, or delete your personal data. Contact us at privacy@vendorkart.shop to exercise these rights.</p>
<h2>8. Changes to This Policy</h2>
<p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on the Platform.</p>`,
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    subtitle: "Understand our refund and return process for orders placed on Vendorkart.",
    content: `<h2>1. Eligibility for Refunds</h2>
<p>Refund requests are accepted within 7 days of delivery for the following reasons:</p>
<ul>
<li>Product received is damaged or defective</li>
<li>Product does not match the description</li>
<li>Wrong item delivered</li>
</ul>
<h2>2. Non-Refundable Items</h2>
<p>Perishable goods, customised orders, and items explicitly marked as non-returnable are not eligible for refunds unless they arrive damaged or defective.</p>
<h2>3. How to Request a Refund</h2>
<p>To initiate a refund, contact our support team through the Platform within the eligible window. Provide your order ID, a description of the issue, and supporting photos if applicable.</p>
<h2>4. Refund Processing</h2>
<p>Once your refund request is approved, the amount will be credited back to your original payment method within 5–10 business days.</p>
<h2>5. Partial Refunds</h2>
<p>In cases where only part of an order is affected, a partial refund proportional to the returned items will be issued.</p>
<h2>6. Vendor Responsibility</h2>
<p>Vendors are responsible for the accuracy of their listings. Refunds due to vendor error are borne by the vendor and deducted from their payable balance.</p>
<h2>7. Dispute Resolution</h2>
<p>If you disagree with a refund decision, you may escalate the dispute through our support portal. Our team will review and respond within 3 business days.</p>`,
  },
  {
    slug: "subscription-refund-policy",
    title: "Subscription Refund Policy",
    subtitle: "Policy for refunds on vendor subscription plans.",
    content: `<h2>1. Subscription Plans</h2>
<p>Vendorkart offers monthly and annual subscription plans for vendors. Subscription fees grant access to premium features, increased product listings, and priority support.</p>
<h2>2. Cancellation Policy</h2>
<p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing cycle — you retain access until that date.</p>
<h2>3. Refund Eligibility</h2>
<p>Subscription fees are generally non-refundable. However, we will issue a full refund if:</p>
<ul>
<li>You cancel within 48 hours of the initial subscription purchase</li>
<li>A technical error on our end caused a duplicate charge</li>
<li>The service was unavailable for more than 72 consecutive hours during your billing period</li>
</ul>
<h2>4. Annual Plan Refunds</h2>
<p>For annual plans cancelled after 48 hours, a pro-rated refund may be issued for the unused months at our discretion, subject to review.</p>
<h2>5. How to Request a Subscription Refund</h2>
<p>Email support@vendorkart.shop with your registered email, subscription plan details, and reason for the refund request. We will respond within 2 business days.</p>
<h2>6. Changes to Subscription Pricing</h2>
<p>Vendorkart reserves the right to adjust subscription pricing. Existing subscribers will be notified at least 30 days in advance of any price change.</p>`,
  },
  {
    slug: "vendor-policy",
    title: "Vendor Policy",
    subtitle: "Guidelines and obligations for vendors selling on Vendorkart.",
    content: `<h2>1. Vendor Eligibility</h2>
<p>Any registered business or individual with valid GST registration (where applicable) may apply to become a vendor on Vendorkart. All applications are subject to review and approval.</p>
<h2>2. Listing Standards</h2>
<p>Vendors must provide accurate, complete, and up-to-date product information including pricing, specifications, and availability. Misleading listings will result in immediate removal.</p>
<h2>3. Prohibited Products</h2>
<ul>
<li>Counterfeit or pirated goods</li>
<li>Hazardous or illegal substances</li>
<li>Products that infringe intellectual property rights</li>
<li>Goods banned under Indian law</li>
</ul>
<h2>4. Order Fulfilment</h2>
<p>Vendors must confirm and dispatch orders within the specified handling time. Failure to fulfil orders consistently may result in account suspension.</p>
<h2>5. Pricing & Commission</h2>
<p>Vendors set their own prices. Vendorkart charges a commission on each sale as per the current commission schedule. The commission rate is displayed in your vendor dashboard.</p>
<h2>6. Customer Service</h2>
<p>Vendors are expected to respond to buyer queries within 24 hours and resolve disputes professionally. Repeated poor service ratings may lead to account review.</p>
<h2>7. Returns & Refunds</h2>
<p>Vendors must honour the platform's refund policy. Refunds due to vendor error will be deducted from pending payouts.</p>
<h2>8. Account Suspension</h2>
<p>Vendorkart reserves the right to suspend or permanently ban vendor accounts that violate these policies, engage in fraudulent activity, or receive consistently negative buyer feedback.</p>`,
  },
];

export async function seedAdminUser() {
  try {
    const [existing] = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);

    if (existing) {
      logger.info({ adminUsername: existing.name }, "Admin user already exists");
    } else {
      const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
      await db.insert(usersTable).values({
        name: DEFAULT_ADMIN_USERNAME,
        email: DEFAULT_ADMIN_EMAIL,
        role: "admin",
        passwordHash,
      });

      logger.info(
        {
          username: DEFAULT_ADMIN_USERNAME,
          email: DEFAULT_ADMIN_EMAIL,
          defaultPassword: DEFAULT_ADMIN_PASSWORD,
        },
        "✅ Default admin user created — change your password immediately via Admin Settings!",
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }

  try {
    await seedLegalPages();
  } catch (err) {
    logger.error({ err }, "Failed to seed legal pages");
  }
}

async function seedLegalPages() {
  const existing = await db.select({ slug: legalPagesTable.slug }).from(legalPagesTable);
  const existingSlugs = new Set(existing.map((r) => r.slug));

  const toInsert = DEFAULT_LEGAL_PAGES.filter((p) => !existingSlugs.has(p.slug));

  if (toInsert.length === 0) {
    logger.info("Legal pages already seeded");
    return;
  }

  await db.insert(legalPagesTable).values(toInsert);
  logger.info({ count: toInsert.length }, "✅ Legal pages seeded");
}
