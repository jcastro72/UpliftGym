# UpliftGym
Uplift Gym website scheduling and maintaining classes

## Run locally

1. Install dependencies:
	- `npm install`
2. Create environment file:
	- `cp .env.example .env`
3. Start server:
	- `npm run dev`
4. Open:
	- `http://localhost:5001` (or your configured `PORT`)

Health checks:
- `http://localhost:5001/health`
- `http://localhost:5001/db-health`
- `http://localhost:5001/test-db`

## Deploy on Raspberry Pi (public web)

### 1) Install runtime

```bash
sudo apt update
sudo apt install -y nodejs npm mariadb-server
```

### 2) Clone and configure app

```bash
git clone <your-repo-url>
cd UpliftGym
npm install
cp .env.example .env
```

Edit `.env` with your real MariaDB values.

### 3) Start app as a service (recommended)

```bash
sudo npm install -g pm2
pm2 start npm --name upliftgym -- start
pm2 save
pm2 startup
```

### 4) Verify on Pi

```bash
curl -i http://localhost:5001/health
curl -i http://localhost:5001/db-health
curl -i http://localhost:5001/test-db
```

### 5) Make it visible for everyone

Use one of these options:

- **Option A (recommended, easiest): Cloudflare Tunnel**
  1. Install `cloudflared` on Pi.
  2. Run tunnel to `http://localhost:5001`.
  3. Share the generated public URL (or map your domain).

- **Option B: Port forwarding + domain**
  1. Forward router port `80/443` to Pi.
  2. Set DNS A record to your public IP.
  3. Put Nginx in front and enable HTTPS with Let's Encrypt.

## Quick production checks (from outside your network)

```bash
curl -i https://<your-public-url>/health
curl -i https://<your-public-url>/db-health
```
