// helpers/razorpay.js
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  // amount should be in paise (INR subunits)
  const options = {
    amount: Math.round(amount * 100), // rupees -> paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1, // auto-capture
    notes,
  }
  return razorInstance.orders.create(options)
}

export const verifyWebhookSignature = (payloadBody, signature, secret = process.env.RAZORPAY_WEBHOOK_SECRET) => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadBody).digest('hex')
  return expectedSignature === signature
}

// Payouts (requires payouts access / RazorpayX)
const payoutClient = new Razorpay({
  key_id: process.env.RAZORPAY_PAYOUT_KEY_ID || process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_PAYOUT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET,
})

// create a payout (composite payout API) - doc: Razorpay Payouts.
// NOTE: in production you must idempotency-key & allowlist IPs per Razorpay docs.
export const createPayoutToBank = async ({ account_number, ifsc, name, amount, currency = 'INR', notes = {} }) => {
  const body = {
    account_number,
    fund_account: {
      account_type: "bank_account",
      bank_account: {
        name,
        ifsc,
        account_number
      }
    },
    amount: Math.round(amount * 100),
    currency,
    mode: "IMPS",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: `payout_${Date.now()}`,
    narration: "Rent payout"
  }
  // simple approach: use payouts create endpoint (specific payload may need adjustment per RazorpayX)
  return payoutClient.payouts.create(body)
}

export default razorInstance
