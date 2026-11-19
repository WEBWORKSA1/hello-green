// One-time helper: sends a test submission so the form relay emails its activation link
// to the site inbox. Run from the "Activate form relay" workflow, then click "Activate" in that email.
const s = (a) => a.map((c) => String.fromCharCode(c - 7)).join('');
const inbox = s([126, 108, 105, 126, 118, 121, 114, 122, 104, 56]) + String.fromCharCode(64) + s([110, 116, 104, 112, 115, 53, 106, 118, 116]);
const origins = (process.env.ORIGINS || 'https://hello.green,https://webworksa1.github.io').split(',');
for (const origin of origins) {
  const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: origin, Referer: `${origin}/` },
    body: JSON.stringify({ _subject: 'Hello.Green | form relay activation', _template: 'table', _captcha: 'false', form: 'activation test', note: `Activation request for forms on ${origin}. Click Activate in this email so quote requests, contest entries and messages reach this inbox.` })
  });
  console.log(origin, res.status, await res.text());
}
