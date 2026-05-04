---
permalink: false
---

# Lead Spam Protection

Rofo tenant lead forms post to `/api/leads/submit`. The submit handler now scores each lead before route resolution and before the Resend approval email is sent.

## What Gets Quarantined

The spam detector returns:

```js
{
  isSpam: boolean,
  isSuspicious: boolean,
  score: number,
  reasons: []
}
```

Leads with score `>= 50` are saved with:

- `status = "spam_quarantined"`
- `lead_json.spam_score`
- `lead_json.spam_reasons`

Quarantined leads do not send approval emails, do not go to OfficeFinder, and do not go to brokers.

Leads with score `25-49` are allowed through as pending, but the spam score and reasons are stored in `lead_json` for review.

## Main Spam Signals

Strong signals:

- honeypot fields filled: `_gotcha` or `company_website`
- missing human checkbox
- invalid numeric dropdown values such as `space_type=1` or `space_needed=1`
- invalid, fake, or short phone numbers
- test/disposable email domains such as `example.com`, `test.com`, or `mailinator.com`
- URLs or link markup in visible fields

Medium signals:

- form submitted in under 3 seconds
- random-looking names
- spam keywords such as casino, crypto, viagra, backlink, SEO service, or guest post
- missing `form_start_time` on known tenant forms

The threshold is intentionally high enough that one weak signal should not block a real tenant lead.

## Review In Dashboard

Use the lead dashboard:

```text
/admin/leads?token=YOUR_TOKEN&status=spam_quarantined
```

Each quarantined lead shows:

- spam status badge
- spam score
- spam reasons
- full stored lead JSON

## Tuning

Spam scoring lives in:

`functions/api/leads/_shared.js`

Look for:

- `detectLeadSpam`
- `EXPECTED_SPACE_TYPES`
- `EXPECTED_SPACE_NEEDED`
- `DISPOSABLE_OR_TEST_EMAIL_DOMAINS`
- `SPAM_KEYWORDS`

To loosen filtering, reduce individual scores or raise the quarantine threshold.

To tighten filtering, add domains/keywords or increase scores for known bad patterns.

## Approval Email Protection

The submit handler checks spam before:

1. missing-field validation
2. route recommendation
3. OfficeFinder payload generation
4. Google Sheets logging
5. Resend approval email

That ordering prevents obvious junk from burning Resend quota.

## Rate Limiting

IP-based rate limiting is not implemented yet. A future version can add a KV-backed throttle, for example 5 submissions per IP hash per 10 minutes. Keep it as a secondary control after content validation so real tenants are not blocked by shared office or mobile networks.
