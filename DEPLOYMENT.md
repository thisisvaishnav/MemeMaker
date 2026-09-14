# Deployment & DNS Runbook — MemeMaker

## Hosting Overview

| Layer | Provider | Details |
|-------|----------|---------|
| Hosting & CDN | **Vercel** | Auto-deploys from `main` branch |
| Domain Registrar | **GoDaddy** | `realmememaker.com` |
| SSL Certificate | **Let's Encrypt** | Auto-provisioned by Vercel |
| Database | **Supabase** | `project_ref=xmlcrgqhyxzmxwzuyaum` |

---

## DNS Configuration (GoDaddy)

Nameservers: `ns59.domaincontrol.com` / `ns60.domaincontrol.com`

| Name | Type | Value | TTL |
|------|------|-------|-----|
| `@` | `A` | `76.76.21.21` | 1 Hour |
| `www` | `CNAME` | `cname.vercel-dns.com` | 1 Hour |

> **Note:** `76.76.21.21` is Vercel's Anycast IP. It handles routing, SSL termination, and CDN for the root domain.
> The `www` CNAME (`ba09899e1eb8f243.vercel-dns-017.com`) is auto-assigned by Vercel and may be project-specific — always confirm in Vercel Dashboard → Settings → Domains.

---

## Vercel Project

- **Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard) → MemeMaker project
- **Domains**: Settings → Domains → `realmememaker.com` must be listed with status ✅ Valid
- **SSL status**: Shown per-domain in the Domains settings page
- **Deployment trigger**: Any push to `main` auto-deploys

---

## SSL Security Headers

Configured in [`vercel.json`](./vercel.json):

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

This enables HSTS for 2 years. **Do not remove or weaken this header** — it is a security requirement. If the site has a DNS misconfiguration, HSTS will prevent browser bypass (intentional).

---

## Troubleshooting

### `ERR_CERT_COMMON_NAME_INVALID` / SSL mismatch

**Symptoms:** Browser shows "Your connection is not private" with `net::ERR_CERT_COMMON_NAME_INVALID`.

**Diagnosis:**
```bash
# Check what IP the domain resolves to locally
dig realmememaker.com +short
# Must return: 76.76.21.21

# Check SSL cert
curl -sv https://realmememaker.com 2>&1 | grep -E "(subject|CN=|issuer)"
# Must show: subject=CN=realmememaker.com  issuer=Let's Encrypt
```

**Fix (5 min in GoDaddy):**
1. Log in to [godaddy.com](https://godaddy.com) → My Products → `realmememaker.com` → **Manage DNS**
2. Find the `A` record where **Name = `@`**
3. Edit → set **Value = `76.76.21.21`** → Save
4. Wait 15–30 min for DNS propagation

**Verify:**
```bash
dig realmememaker.com +short          # → 76.76.21.21
curl -I https://realmememaker.com     # → HTTP/2 200
```

---

### HSTS cache blocking a fixed site

If a user's browser cached an HSTS error, they need to clear it:
1. Go to `chrome://net-internals/#hsts`
2. Under **Delete domain security policies** → enter `realmememaker.com` → **Delete**
3. Reload the site in a new tab

---

### Vercel SSL certificate not provisioning

If the domain is added to Vercel but SSL shows "Pending":
1. Confirm the `A` record resolves to `76.76.21.21` — Vercel cannot issue a cert until DNS is correct
2. Wait up to 24 hours after a DNS change for Let's Encrypt to provision
3. In Vercel Dashboard → Domains, click **Refresh** or **Re-issue certificate**

---

## Deployment Checklist (before going live)

- [ ] `A` record for `@` = `76.76.21.21` in GoDaddy
- [ ] `CNAME` for `www` = `cname.vercel-dns.com` in GoDaddy
- [ ] Domain shows ✅ Valid in Vercel Dashboard → Settings → Domains
- [ ] `curl -I https://realmememaker.com` returns `HTTP/2 200`
- [ ] Padlock shows "Connection is secure" with `realmememaker.com` cert
- [ ] `npm test` passes
- [ ] `npm run build` completes without errors
