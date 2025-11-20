// server/controllers/webhookController.js
import asyncHandler from '../middleware/asyncHandler.js';
import Tenant from '../models/Tenant.js';
import Customer from '../models/Customer.js';
import InboundMessage from '../models/InboundMessage.js';
import PendingUser from '../models/PendingUser.js';
// We'll need the full finalizeRegistration logic here or imported
import { finalizeRegistrationLogic } from '../services/registrationService.js';
// Import your notification service if you want to forward the message to the admin
// import { sendAdminAlertEmail } from '../services/notificationService.js';

// @desc    Handle incoming WhatsApp messages from Twilio
// @route   POST /api/webhooks/twilio-whatsapp
// @access  Public (but secured by Twilio's signature validation)
const handleTwilioWhatsapp = asyncHandler(async (req, res) => {
    // Twilio sends data as application/x-www-form-urlencoded
    const { From, To, Body, MessageSid } = req.body;

    console.log(`[Twilio Webhook] Received message from ${From} to ${To}. SID: ${MessageSid}`);
    console.log(`[Twilio Webhook] Body: ${Body}`);

    // --- Find which tenant this message belongs to ---
    // The 'To' number should be a Twilio number linked to one of your tenants.
    // You need a way to map this number back to a tenantId.
    // For now, let's assume you've stored this in the Tenant model.
    // A better approach might be a dedicated `PhoneNumber` model if a tenant can have multiple.
    const tenant = await Tenant.findOne({ publicPhone: To.replace('whatsapp:', '') }); // Or a dedicated `twilioWhatsappNumber` field

    if (!tenant) {
        console.error(`[Twilio Webhook] No tenant found for incoming number ${To}. Ignoring message.`);
        // Respond to Twilio so it doesn't keep retrying.
        // We send an empty TwiML response.
        res.type('text/xml').send('<Response></Response>');
        return;
    }

    // --- Find the customer who sent the message ---
    const customer = await Customer.findOne({
        phone: From.replace('whatsapp:', ''),
        tenantId: tenant._id
    });

    // --- Save the inbound message to the database ---
    await InboundMessage.create({
        tenantId: tenant._id,
        from: From,
        to: To,
        body: Body,
        twilioMessageSid: MessageSid,
        customerId: customer ? customer._id : null, // Link to customer if found
        rawPayload: req.body,
    });

    // --- Process the message and generate a reply ---
    let replyMessage = '';
    const lowerCaseBody = Body.toLowerCase().trim();

    if (lowerCaseBody.startsWith('status')) {
        // TODO: Implement order status lookup logic
        replyMessage = "Thank you for your inquiry. We are looking up your order status and will reply shortly.";
    } else if (lowerCaseBody === 'help') {
        replyMessage = `Welcome to ${tenant.name}! You can ask for your order status by texting "status #YourReceiptNumber".`;
    } else {
        // --- Forward message to the business owner (admin) ---
        // This is a crucial step for general inquiries.
        console.log(`[Twilio Webhook] Forwarding general inquiry from ${From} to admin of tenant ${tenant.name}.`);
        // await sendAdminAlertEmail(tenant.adminEmail, `New WhatsApp Message from ${From}`, `Message: ${Body}`);
        // For now, we will just send a simple auto-reply.
        replyMessage = `Thank you for contacting ${tenant.name}. We have received your message and will get back to you shortly.`;
    }

    // --- Respond to Twilio with TwiML to send the reply ---
    // You need the twilio package for this: npm install twilio
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyMessage);

    res.type('text/xml').send(twiml.toString());
});
// @desc    Handle incoming webhooks from AccountPe
// @route   POST /api/webhooks/accountpe
// @access  Public
const accountPeWebhook = asyncHandler(async (req, res) => {
    const { transaction_id, status } = req.body;

    console.log(`[Webhook] Received for transaction: ${transaction_id}, status: ${status}`);

    if (status === 'success') {
        if (transaction_id.startsWith('PRESSFLOW-SUB-')) {
            // This is for a new user registration
            const pendingUser = await PendingUser.findOne({ 'signupData.transactionId': transaction_id });
            if (pendingUser) {
                console.log(`Finalizing registration for ${pendingUser.email}`);
                // You MUST refactor your finalizeRegistration controller logic into a reusable
                // function (`finalizeRegistrationLogic`) that can be called from here.
                // This function will create the Tenant, User, Settings, etc.
                await finalizeRegistrationLogic(pendingUser);
            } else {
                console.error(`[Webhook] No pending user found for SUB transaction: ${transaction_id}`);
            }
        } else if (transaction_id.startsWith('PRESSFLOW-UPGRADE-')) {
            // This is for an existing user upgrade
            // You would need to find the tenant based on the saved transactionId
            // For now, we'll extract the tenant ID from the transaction string
            const tenantId = transaction_id.split('-')[2]; 
            const tenant = await Tenant.findById(tenantId);
            const newPlanName = "Pro"; // This should also be stored with the payment intent
            
            if (tenant) {
                console.log(`Upgrading subscription for ${tenant.name}`);
                const nextBillingDate = new Date();
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

                tenant.plan = newPlanName;
                tenant.subscriptionStatus = 'active';
                tenant.trialEndsAt = undefined;
                tenant.nextBillingAt = nextBillingDate;
                await tenant.save();
            } else {
                console.error(`[Webhook] No tenant found for UPGRADE transaction: ${transaction_id}`);
            }
        }
    }

    res.status(200).send('Webhook received.');
});

export { accountPeWebhook, handleTwilioWhatsapp };
