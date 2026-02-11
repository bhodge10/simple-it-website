const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { contact_email, contact_name, subject, ticketNumber, priority } = data;

        // Validate required fields
        if (!contact_email || !contact_name || !ticketNumber) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create SMTP transporter
        const transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP2GO_USERNAME,
                pass: process.env.SMTP2GO_PASSWORD
            }
        });

        // Priority labels
        const priorityLabels = {
            'urgent': 'Urgent',
            'high': 'High',
            'normal': 'Normal',
            'low': 'Low'
        };

        const priorityLabel = priorityLabels[priority] || 'Normal';

        // Email to customer
        const customerEmail = {
            from: '"Simple IT Support" <support@simple-it.us>',
            to: contact_email,
            subject: `Ticket Received: ${subject} [#${ticketNumber}]`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .ticket-info {
            background: #f5f7fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .ticket-number {
            font-size: 28px;
            font-weight: bold;
            color: #0066FF;
            text-align: center;
            margin: 10px 0;
        }
        .info-row {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #666;
            display: inline-block;
            width: 120px;
        }
        .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .priority-urgent {
            background: #ff4444;
            color: white;
        }
        .priority-high {
            background: #ff9800;
            color: white;
        }
        .priority-normal {
            background: #4CAF50;
            color: white;
        }
        .priority-low {
            background: #9e9e9e;
            color: white;
        }
        .response-box {
            background: #e3f2fd;
            border-left: 4px solid #0066FF;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .response-box strong {
            color: #0066FF;
            font-size: 18px;
        }
        .contact-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-info a {
            color: #0066FF;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #0066FF;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Support Ticket Received</h1>
    </div>
    
    <div class="content">
        <p>Hi ${contact_name},</p>
        
        <p>Thank you for contacting Simple IT! We've received your support request and our team has been notified.</p>
        
        <div class="ticket-info">
            <div style="text-align: center; color: #666; font-size: 14px;">Your Ticket Number</div>
            <div class="ticket-number">#${ticketNumber}</div>
            
            <div style="margin-top: 20px;">
                <div class="info-row">
                    <span class="info-label">Subject:</span>
                    <span>${subject}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Priority:</span>
                    <span class="priority priority-${priority}">${priorityLabel}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span>Open - Awaiting Response</span>
                </div>
            </div>
        </div>
        
        <div class="response-box">
            <strong>⚡ Want Faster Response Times?</strong>
            <p style="margin: 10px 0 0 0;">Our Managed Service clients get guaranteed 15-minute response times and priority support. Ask us about upgrading to managed services for predictable IT support when you need it most.</p>
        </div>
        
        <p><strong>What Happens Next:</strong></p>
        <ul>
            <li>A technician will review your ticket immediately</li>
            <li>You'll receive an email update when we respond</li>
            <li>For urgent issues, we may call you directly</li>
            <li>You can reply to this email to add more information</li>
        </ul>
        
        <div class="contact-info">
            <p><strong>Need Immediate Assistance?</strong></p>
            <p>Call us directly: <a href="tel:8594497878">859-449-7878</a></p>
            <p>Email: <a href="mailto:support@simple-it.us">support@simple-it.us</a></p>
        </div>
        
        <p>Thank you for choosing Simple IT!</p>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Simple IT Support Team</strong><br>
            2220 Grandview Drive, Suite 250<br>
            Ft. Mitchell, KY 41017
        </p>
    </div>
    
    <div class="footer">
        <p>This is an automated confirmation. Please do not reply to this email.</p>
        <p>For support, call 859-449-7878 or email support@simple-it.us</p>
        <p>&copy; ${new Date().getFullYear()} Simple IT, LLC. All rights reserved.</p>
    </div>
</body>
</html>
            `
        };

        // Send email
        await transporter.sendMail(customerEmail);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                message: 'Confirmation email sent'
            })
        };

    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to send confirmation email'
            })
        };
    }
};
