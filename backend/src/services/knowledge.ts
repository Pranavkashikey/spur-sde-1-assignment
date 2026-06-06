/**
 * Domain knowledge for "Spark & Co." — the fictional e-commerce store.
 * This gets injected into every LLM system prompt so the agent can answer
 * customer questions reliably without hallucinating policies.
 */

export const STORE_KNOWLEDGE = `
## About Spark & Co.
Spark & Co. is an online store specialising in premium home electronics, smart gadgets,
and lifestyle accessories. We ship across India and internationally.

## Shipping Policy
- **Domestic (India):** Free standard shipping on all orders above ₹999.
  Orders below ₹999 attract a flat ₹79 shipping fee.
  Standard delivery: 3–5 business days.
  Express delivery (₹199 extra): 1–2 business days.
- **International:** Available to 40+ countries. Shipping charges calculated at checkout.
  Delivery: 7–14 business days. Import duties are the buyer's responsibility.
- **Order cut-off:** Orders placed before 2 PM IST on business days ship the same day.
- **Tracking:** A tracking link is emailed within 24 hours of dispatch.

## Return & Refund Policy
- **Return window:** 30 days from the date of delivery.
- **Condition:** Items must be unused, in original packaging with all accessories and invoice.
- **How to return:** Email support@sparkandco.in with your order ID and reason.
  Our team will arrange a free pickup within 48 hours.
- **Refund timeline:** Refunds are processed within 5–7 business days after we receive
  the returned item. Refunds go back to the original payment method.
- **Non-returnable items:** Gift cards, consumables (batteries, cables used), and items
  marked "Final Sale".
- **Damaged / wrong items:** Report within 48 hours of delivery; we'll replace or refund
  with no return required.

## Payment Methods
We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, EMI (6/12/24 months
on orders above ₹3,000), and Cash on Delivery (COD) for orders below ₹5,000.

## Warranty
- All products carry the manufacturer's warranty (typically 1 year).
- Spark & Co. also offers an optional 2-year extended warranty at checkout for ₹299–₹999
  depending on product category.

## Support Hours
- **Live chat & email:** Monday to Saturday, 9 AM – 7 PM IST.
- **Phone support:** +91-80-4567-8910, Monday to Friday, 10 AM – 6 PM IST.
- **Response time:** Email replies within 4 business hours; live chat typically under 2 minutes.

## Loyalty Program — Spark Points
Earn 1 Spark Point per ₹10 spent. 100 points = ₹10 discount on future orders.
Points expire 12 months after earning.

## Frequently Asked Questions
Q: Can I change or cancel my order?
A: Orders can be modified or cancelled within 1 hour of placing them. After that, please
   wait for delivery and initiate a return.

Q: Do you offer bulk / corporate pricing?
A: Yes! Email b2b@sparkandco.in with your requirements for a custom quote.

Q: Is COD available everywhere?
A: COD is available for most domestic pin codes for orders below ₹5,000. Enter your pin
   code at checkout to confirm availability.
`.trim();
