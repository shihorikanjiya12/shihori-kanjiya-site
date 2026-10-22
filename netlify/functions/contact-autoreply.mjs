/**
 * Netlify Forms -> Resend 受付確認メール
 * Trigger: verified Netlify form submission (platform-signed event).
 * The RESEND_API_KEY secret is configured in Netlify, never stored in this repo.
 */
const FROM = '貫地谷しほり <contact@shihorikanjiya.com>';
const REPLY_TO = 's.kanjiya.management@gmail.com';
const SUBJECT = 'お問い合わせを受け付けました';

function clean(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export default {
  async formSubmitted(event) {
    // Only send if explicitly enabled by the site owner after testing.
    if (process.env.AUTOREPLY_ENABLED !== 'true') return;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Auto-reply skipped: RESEND_API_KEY is not set');
      return;
    }

    const d = event?.data || {};
    // This site currently contains only one Netlify form. Guard any form names
    // exposed by the Netlify event so a future form cannot trigger these emails.
    const formName = event?.form?.name || d['form-name'] || d.form_name;
    if (formName && formName !== 'contact') return;
    if (clean(d['bot-field'], 200)) return;

    const email = clean(d.email, 254);
    const name = clean(d.name, 200);
    const company = clean(d.company, 200);
    const type = clean(d.type, 100);
    const tel = clean(d.tel, 100);
    const message = clean(d.message, 15000);
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !name || !company || !type || !message) {
      console.warn('Auto-reply skipped: required contact fields missing or invalid');
      return;
    }

    // Keep the previously used email wording and include the contacter's copy.
    const body = `${name} 様\n\n` +
      `この度はお問い合わせをいただき、誠にありがとうございます。\n` +
      `内容を確認させていただきまして、担当者より改めてご連絡いたします。\n\n` +
      `------------------------------\n` +
      `■お問い合わせ種別\n${type}\n\n` +
      `■会社名\n${company}\n\n` +
      `■お名前\n${name}\n\n` +
      (tel ? `■電話番号\n${tel}\n\n` : '') +
      `■お問い合わせ内容\n${message}\n` +
      `------------------------------\n\n` +
      `※ 依頼書・企画書等の資料がございましたら、このメールにご返信のうえご添付ください。\n\n` +
      `なお、このメールは自動送信です。\n\n` +
      `貫地谷しほり`;

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    // If the event includes a stable submission ID, protect against duplicate
    // emails on retries. Avoid hashing content, since different submissions can match.
    const eventId = event?.submission?.id || event?.submissionId || event?.id;
    if (typeof eventId === 'string' && eventId && eventId.length < 200) {
      headers['Idempotency-Key'] = `contact-ack/${eventId}`;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        text: body,
      }),
    });
    if (!response.ok) {
      // Avoid logging user-submitted PII or the API key.
      console.error(`Auto-reply failed: Resend HTTP ${response.status}`);
      throw new Error(`Resend HTTP ${response.status}`);
    }
    console.info('Contact auto-reply accepted by Resend');
  },
};
