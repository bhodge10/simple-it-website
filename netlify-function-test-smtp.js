// Test function to diagnose SMTP2GO connection
// File: netlify/functions/test-smtp.js

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  try {
    console.log('Testing SMTP2GO connection...');
    console.log('API Key exists:', !!process.env.SMTP2GO_API_KEY);
    console.log('API Key starts with:', process.env.SMTP2GO_API_KEY?.substring(0, 4));

    // Test configuration
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP2GO_API_KEY,
        pass: process.env.SMTP2GO_API_KEY
      },
      debug: true,
      logger: true
    });

    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection successful!');

    // Try sending a test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"Simple IT Test" <info@simple-it.us>',
      to: 'brad.hodge@simple-it.us',
      subject: 'SMTP2GO Test from Netlify',
      text: 'If you receive this, SMTP2GO is working!',
      html: '<b>If you receive this, SMTP2GO is working!</b>'
    });

    console.log('✓ Email sent:', info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'SMTP2GO connection and email test successful!',
        messageId: info.messageId
      })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      })
    };
  }
};
