/** HTML for the waitlist confirmation email. Colours are the literal hex
 * values behind `--color-brand-green` / `--color-brand-gold` etc. (see
 * `src/app/globals.css`) — email clients don't resolve CSS custom
 * properties, so the tokens have to be inlined by hand. */

export function buildWaitlistConfirmationEmail(name: string) {
  const firstName = name.trim().split(" ")[0] ?? "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0C2B1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C2B1A;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:40px;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-2px;">didii<span style="color:#E9A84C;">.</span></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#123B25;border:1px solid #1A4A2E;border-radius:20px;padding:40px 36px;">

              <p style="margin:0 0 24px;font-size:16px;color:#8FB39C;line-height:1.5;">
                Hey${firstName ? " " + firstName : ""}.
              </p>

              <p style="margin:0 0 20px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.2;">
                You're in.
              </p>

              <p style="margin:0 0 20px;font-size:15px;color:#CDE3D2;line-height:1.65;">
                We're building didii — banking that gets to know you. Transfers, bills, data, cashing out your crypto. You just talk, we handle it.
              </p>

              <p style="margin:0 0 32px;font-size:15px;color:#CDE3D2;line-height:1.65;">
                When we launch, you'll be one of the first people in. We'll reach out on this email — keep an eye out.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #1A4A2E;margin-bottom:28px;"></div>

              <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5E7E6B;">What happens next</p>
              <p style="margin:0 0 8px;font-size:14px;color:#8FB39C;line-height:1.55;">
                1 — We'll notify you the moment didii launches.
              </p>
              <p style="margin:0 0 8px;font-size:14px;color:#8FB39C;line-height:1.55;">
                2 — Download the app, complete BVN verification (30 seconds).
              </p>
              <p style="margin:0 0 0;font-size:14px;color:#8FB39C;line-height:1.55;">
                3 — Your wallet is live. Just talk to didii.
              </p>

            </td>
          </tr>

          <!-- Footer / Signature -->
          <tr>
            <td style="padding-top:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#456352;line-height:1.6;">
                — didii
              </p>
              <p style="margin:0;font-size:12px;color:#3A5445;line-height:1.5;">
                hi@didiiai.com &middot; didiiai.com<br/>
                Anchor partner bank &middot; CBN-regulated &middot; NDIC-insured deposits
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { html, subject: `You're in${firstName ? ", " + firstName : ""}.` };
}
