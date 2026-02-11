// Netlify Function to automatically email PDF guide via SMTP2GO
// File: netlify/functions/send-guide.js

const nodemailer = require('nodemailer');

// Disposable/temporary email domains commonly used by spammers
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.net', 'trashmail.com', 'trashmail.me',
  'trashmail.net', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com',
  'tempail.com', 'tempr.email', 'temp-mail.org', 'temp-mail.io',
  'emailondeck.com', 'getnada.com', 'mohmal.com', 'burnermail.io',
  '10minutemail.com', 'minutemail.com', 'emailfake.com', 'crazymailing.com',
  'mailnesia.com', 'mailtothis.com', 'harakirimail.com'
];

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

function isDisposableEmail(email) {
  const domain = email.split('@')[1].toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

function containsSpamPatterns(name, company) {
  const spamPatterns = [
    /https?:\/\//i,          // URLs in name/company fields
    /<[^>]*>/,               // HTML tags
    /\[url/i,                // BBCode links
    /viagra|cialis|casino|crypto|bitcoin|lottery|prize|winner/i,
    /(.)\1{5,}/,             // Repeated characters (e.g., "aaaaaa")
  ];
  const text = `${name} ${company || ''}`;
  return spamPatterns.some(pattern => pattern.test(text));
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse form data
    const data = JSON.parse(event.body);
    const { name, email, company, _timing } = data;

    // Validate required fields
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and email are required' })
      };
    }

    // Anti-spam: validate email format
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Anti-spam: reject disposable email addresses
    if (isDisposableEmail(email)) {
      // Return success to avoid tipping off spammers
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Guide sent successfully!' })
      };
    }

    // Anti-spam: reject if submission was too fast (< 3 seconds)
    if (_timing && _timing < 3000) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Guide sent successfully!' })
      };
    }

    // Anti-spam: check for spam content in name/company fields
    if (containsSpamPatterns(name, company)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Guide sent successfully!' })
      };
    }

    // Configure SMTP2GO with username and password
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587, // Port 587 is more firewall-friendly than 2525
      secure: false,
      auth: {
        user: process.env.SMTP2GO_USERNAME,
        pass: process.env.SMTP2GO_PASSWORD
      }
    });

    // Email to lead (with PDF attachment)
    const leadEmail = {
      from: '"Simple IT" <info@simple-it.us>',
      to: email,
      subject: 'Your IT Security Checklist from Simple IT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2B4C7E; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Simple IT</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f5f5f5;">
            <h2 style="color: #2B4C7E;">Hi ${name},</h2>
            
            <p>Thank you for downloading <strong>"The Northern Kentucky Business Owner's IT Security Checklist"</strong>!</p>
            
            <p>This comprehensive guide includes:</p>
            <ul style="line-height: 1.8;">
              <li>15 critical security vulnerabilities most businesses miss</li>
              <li>Simple checklist to audit your current IT setup</li>
              <li>Red flags that mean you need to switch IT providers</li>
              <li>Cost calculator: What you should be paying for IT</li>
            </ul>
            
            <p><strong>Your guide is attached to this email as a PDF.</strong></p>
            
            <hr style="border: 1px solid #ddd; margin: 30px 0;">
            
            <h3 style="color: #2B4C7E;">Want Us to Complete This Checklist For You?</h3>
            
            <p>We offer a <strong>FREE IT Security Assessment</strong> where we'll:</p>
            <ul style="line-height: 1.8;">
              <li>Complete this entire checklist for your business</li>
              <li>Test your backups</li>
              <li>Scan for vulnerabilities</li>
              <li>Provide a detailed report with costs</li>
              <li>Give you a prioritized action plan</li>
            </ul>
            
            <p><strong>No obligation. No sales pressure. Just helpful information.</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://simple-it.us/contact-us" 
                 style="background-color: #2B4C7E; color: white; padding: 15px 40px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold;">
                Schedule Your Free Assessment →
              </a>
            </div>
            
            <p>Or give us a call: <strong>859-449-7878</strong></p>
          </div>
          
          <div style="background-color: #2B4C7E; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;"><strong>Simple IT, LLC</strong></p>
            <p style="margin: 5px 0;">2220 Grandview Drive, Suite 250 | Ft. Mitchell, KY 41017</p>
            <p style="margin: 5px 0;">Phone: 859-449-7878 | Web: simple-it.us</p>
            <p style="margin: 15px 0 5px 0; font-size: 10px; opacity: 0.8;">
              You're receiving this because you requested our IT Security Checklist.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'IT-Security-Checklist-Guide.pdf',
          path: 'https://simple-it-us.netlify.app/downloads/it-security-checklist-guide.pdf',
          contentType: 'application/pdf'
        }
      ]
    };

    // Email to you (notification)
    const notificationEmail = {
      from: '"Website Lead" <info@simple-it.us>',
      to: 'info@simple-it.us', // Change to your preferred email
      subject: `New Lead: ${name} downloaded IT Security Checklist`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2B4C7E;">New Lead from Website</h2>
          
          <p><strong>Someone just downloaded your IT Security Checklist!</strong></p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Company:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${company || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
          <ol>
            <li>Add to CRM/contact list</li>
            <li>Follow up within 24 hours</li>
            <li>Offer free IT security assessment</li>
          </ol>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This lead was automatically captured from simple-it.us/lead-magnet form.
          </p>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(leadEmail);
    await transporter.sendMail(notificationEmail);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Guide sent successfully!' 
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      })
    };
  }
};
