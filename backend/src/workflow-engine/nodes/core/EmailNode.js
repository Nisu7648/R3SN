/**
 * Email Node - Send emails via SMTP
 * Supports attachments, HTML, and templates
 */

const nodemailer = require('nodemailer');

class EmailNode {
  constructor() {
    this.type = 'email.send';
    this.name = 'Send Email';
    this.description = 'Send emails via SMTP with attachments and HTML support';
    this.category = 'communication';
    this.icon = '📧';
    this.color = '#D32F2F';

    this.inputs = [
      {
        name: 'to',
        type: 'string',
        required: false
      },
      {
        name: 'subject',
        type: 'string',
        required: false
      },
      {
        name: 'body',
        type: 'string',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'messageId',
        type: 'string'
      },
      {
        name: 'success',
        type: 'boolean'
      }
    ];

    this.parameters = [
      {
        name: 'smtpHost',
        type: 'string',
        required: true,
        placeholder: 'smtp.gmail.com',
        description: 'SMTP server host'
      },
      {
        name: 'smtpPort',
        type: 'number',
        default: 587,
        description: 'SMTP server port'
      },
      {
        name: 'secure',
        type: 'boolean',
        default: false,
        description: 'Use TLS/SSL'
      },
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'SMTP username'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        sensitive: true,
        description: 'SMTP password'
      },
      {
        name: 'from',
        type: 'string',
        required: true,
        placeholder: 'sender@example.com',
        description: 'Sender email address'
      },
      {
        name: 'to',
        type: 'string',
        required: false,
        placeholder: 'recipient@example.com',
        description: 'Recipient email address'
      },
      {
        name: 'cc',
        type: 'string',
        required: false,
        description: 'CC email addresses (comma-separated)'
      },
      {
        name: 'bcc',
        type: 'string',
        required: false,
        description: 'BCC email addresses (comma-separated)'
      },
      {
        name: 'subject',
        type: 'string',
        required: false,
        placeholder: 'Email subject',
        description: 'Email subject'
      },
      {
        name: 'body',
        type: 'code',
        required: false,
        placeholder: 'Email body content',
        description: 'Email body (text or HTML)'
      },
      {
        name: 'isHtml',
        type: 'boolean',
        default: false,
        description: 'Body is HTML'
      },
      {
        name: 'attachments',
        type: 'array',
        required: false,
        description: 'Email attachments'
      },
      {
        name: 'replyTo',
        type: 'string',
        required: false,
        description: 'Reply-to email address'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      smtpHost,
      smtpPort,
      secure,
      username,
      password,
      from,
      to: paramTo,
      cc,
      bcc,
      subject: paramSubject,
      body: paramBody,
      isHtml,
      attachments,
      replyTo
    } = parameters;

    const to = inputs.to || paramTo;
    const subject = inputs.subject || paramSubject;
    const body = inputs.body || paramBody;

    if (!to || !subject || !body) {
      throw new Error('To, subject, and body are required');
    }

    try {
      // Create transporter
      const transporter = nodemailer.createTransporter({
        host: smtpHost,
        port: smtpPort,
        secure,
        auth: {
          user: username,
          pass: password
        }
      });

      // Prepare email options
      const mailOptions = {
        from,
        to,
        subject,
        replyTo: replyTo || from
      };

      // Set body (text or HTML)
      if (isHtml) {
        mailOptions.html = body;
      } else {
        mailOptions.text = body;
      }

      // Add CC and BCC
      if (cc) mailOptions.cc = cc;
      if (bcc) mailOptions.bcc = bcc;

      // Add attachments
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }));
      }

      // Send email
      const info = await transporter.sendMail(mailOptions);

      return {
        messageId: info.messageId,
        success: true,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      };

    } catch (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
  }
}

module.exports = EmailNode;
