import nodemailer from "nodemailer";

// Using Gmail SMTP via App Password
// The user should set SMTP_USER and SMTP_PASS environment variables,
// or we use a fallback Ethereal (test) transport
let transporter: nodemailer.Transporter;

const SMTP_USER = process.env.SMTP_USER || "arellaraghavendra@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "nrcfvdowyjxfycga";

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log(`📧 Email configured with: ${SMTP_USER}`);
} else {
  // Fallback: create an Ethereal test account (emails won't actually send but won't crash)
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "test@ethereal.email",
      pass: "test",
    },
  });
  console.log("⚠️  No SMTP_USER/SMTP_PASS set. Email sending is disabled. Set environment variables to enable.");
}

export async function sendCriticalAlertEmail(
  guardianEmail: string,
  patientName: string,
  riskLevel: string,
  riskScore: number,
  symptoms: string[],
  possibleConditions: string[],
  recommendedAction: string
): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log(`📧 [MOCK] Would send critical alert email to ${guardianEmail} for patient ${patientName}`);
    return false;
  }

  const symptomsText = symptoms.length > 0 ? symptoms.join(", ") : "Described via text";
  const conditionsText = possibleConditions.join(", ");

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Critical Health Alert</h1>
        <p style="color: rgba(255,255,255,0.85); margin-top: 8px; font-size: 14px;">Immediate attention may be required</p>
      </div>
      
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Dear Guardian/Parent,
        </p>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          A symptom check performed by <strong>${patientName}</strong> on <strong>RuralCare Health Insight Hub</strong> 
          has been identified as <span style="color: #dc2626; font-weight: bold;">${riskLevel}</span> risk.
        </p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666; width: 140px;">Risk Score:</td>
              <td style="padding: 6px 0; color: #dc2626; font-weight: bold; font-size: 20px;">${riskScore}/100</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Risk Level:</td>
              <td style="padding: 6px 0; color: #dc2626; font-weight: bold;">${riskLevel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Symptoms:</td>
              <td style="padding: 6px 0; color: #333;">${symptomsText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Possible Conditions:</td>
              <td style="padding: 6px 0; color: #333;">${conditionsText}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
          <p style="color: #9a3412; font-size: 14px; margin: 0;">
            <strong>Recommended Action:</strong><br />
            ${recommendedAction}
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 24px;">
          ⚠️ This is an automated alert from RuralCare AI health analysis. Please take appropriate action 
          and consult a medical professional if necessary. If this is a medical emergency, call <strong>112</strong> immediately.
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          RuralCare Health Insight Hub &bull; AI-Powered Health Monitoring
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"RuralCare Health Alert" <${SMTP_USER}>`,
      to: guardianEmail,
      subject: `🚨 Critical Health Alert for ${patientName} — Risk Level: ${riskLevel}`,
      html,
    });
    console.log(`📧 Critical alert email sent to ${guardianEmail} for patient ${patientName}`);
    return true;
  } catch (err) {
    console.error("Failed to send critical alert email:", err);
    return false;
  }
}
