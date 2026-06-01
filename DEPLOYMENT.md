# Frontend (LSM-FE) — Deploy to S3 + CloudFront

React + Vite SPA. Built in CI and pushed to an S3 bucket served through CloudFront (HTTPS, CDN, SPA routing). Pipeline: [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## How it works
On push to `main`: install → lint → `yarn build` → `aws s3 sync dist/` → CloudFront invalidation.

---

## 1. One-time AWS setup

### S3 bucket
```bash
aws s3 mb s3://your-lms-frontend --region us-east-1
```
Keep **Block Public Access ON** — CloudFront reaches it privately via OAC (recommended). Do **not** enable S3 static website hosting; CloudFront serves it.

### CloudFront distribution
- **Origin:** the S3 bucket, using **Origin Access Control (OAC)** (CloudFront console offers to update the bucket policy automatically).
- **Default root object:** `index.html`
- **SPA routing:** add custom error responses so client-side routes work —
  - `403` → response `/index.html`, HTTP 200
  - `404` → response `/index.html`, HTTP 200
- **Viewer protocol policy:** Redirect HTTP → HTTPS
- (Optional) attach your domain + an ACM cert (cert must be in **us-east-1** for CloudFront).

Note the **Distribution ID** for the pipeline.

## 2. CI credentials (IAM)
Create an IAM user (or role) limited to this bucket + distribution:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["s3:PutObject","s3:DeleteObject","s3:ListBucket","s3:GetObject"],
      "Resource": ["arn:aws:s3:::your-lms-frontend","arn:aws:s3:::your-lms-frontend/*"] },
    { "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "*" }
  ]
}
```
> More secure alternative: use GitHub OIDC + an IAM role instead of long-lived keys (swap the `configure-aws-credentials` inputs for `role-to-assume`).

## 3. GitHub repo configuration
**Settings → Secrets and variables → Actions**

Secrets:
| Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret |

Variables:
| Name | Example |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET` | `your-lms-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E123ABC...` |
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `VITE_SOCKET_URL` | `https://api.yourdomain.com` |

## 4. Push to deploy
```bash
cd LSM-FE
git init && git add . && git commit -m "Initial frontend"
git branch -M main
git remote add origin https://github.com/<you>/lms-frontend.git
git push -u origin main
```

⚠️ **`VITE_API_URL` must be HTTPS.** The site is served over HTTPS via CloudFront, so a plain `http://` backend will be blocked as mixed content. See the backend's TLS setup (nginx + Let's Encrypt) in LMS-BE.
