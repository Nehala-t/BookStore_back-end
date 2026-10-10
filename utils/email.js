import nodemailer from "nodemailer";

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// =====================================================
// SEND ACCOUNT STATUS EMAIL
// =====================================================

export const sendAccountStatusEmail = async ({
  email,
  firstName,
  status,
}) => {
  let subject = "";
  let message = "";

  // ===================================================
  // ACCEPTED
  // ===================================================

  if (status === "Accepted") {
    subject =
      "Your BookStore account has been approved";

    message = `
      <h2>Account Approved</h2>

      <p>Hello ${firstName},</p>

      <p>
        Good news! Your BookStore account has been
        approved by the admin.
      </p>

      <p>
        You can now log in and start using
        BookStore.
      </p>

      <p>
        Thank you for joining BookStore.
      </p>

      <br />

      <p>
        Regards,<br />
        BookStore Team
      </p>
    `;
  }

  // ===================================================
  // REJECTED
  // ===================================================

  if (status === "Rejected") {
    subject =
      "Update regarding your BookStore account";

    message = `
      <h2>Account Rejected</h2>

      <p>Hello ${firstName},</p>

      <p>
        We are sorry to inform you that your
        BookStore account has been rejected by
        the admin.
      </p>

      <p>
        If you believe this was a mistake, please
        contact the BookStore administration team.
      </p>

      <br />

      <p>
        Regards,<br />
        BookStore Team
      </p>
    `;
  }

  // ===================================================
  // SEND EMAIL
  // ===================================================

  await transporter.sendMail({
    from: `"BookStore" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: subject,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          color: #333;
        "
      >

        <div
          style="
            background: #111827;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          "
        >
          <h1 style="margin: 0;">
            Book<span style="color: #ea580c;">
              Store
            </span>
          </h1>
        </div>

        <div
          style="
            border: 1px solid #e5e7eb;
            border-top: none;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          "
        >

          ${message}

        </div>

      </div>
    `,
  });

  console.log(
    `Status email sent to ${email}`
  );
};