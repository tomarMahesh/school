# Putting the school website live

One small Linux server runs everything: the website, the MySQL database and automatic HTTPS
(Docker Compose). Typical cost: roughly ₹500-1,000 a month, plus the domain.

## 1. Before you start
- A **domain** you own.
- A **2 GB RAM** Linux server (Ubuntu 24.04), ideally in Mumbai or Bangalore. 1 GB is too small.
- **SMS for admin sign-in codes** must work BEFORE the first admin login (see "SMS" below).
- A Gmail App Password (or other SMTP login) for password emails.

## 2. Point the domain at the server
At your domain registrar's DNS page add two **A records** to the server's IP address:
`@` (the bare domain) and `www`. Wait until they resolve (usually minutes).

## 3. Prepare the server (once)
```bash
ssh ubuntu@SERVER_IP
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # then log out and back in
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 4. Get the code and configure it
```bash
git clone https://github.com/tomarMahesh/school.git && cd school
git checkout main
cp .env.example .env && nano .env
```
Fill in `.env` (the file explains each line). Make secrets with `openssl rand -hex 32`
(use letters/digits only for the two MySQL passwords). **Copy `.env` somewhere safe
(password manager) -- especially `DATA_ENCRYPTION_KEY`.**

## 5. Start it
```bash
docker compose up -d --build
docker compose logs -f app        # wait for "Ready", then Ctrl+C
```
The database tables are created automatically. Visit `https://yourdomain` -- the HTTPS
certificate is issued on first visit (takes a few seconds).

## 6. Create your admin
```bash
docker compose exec app npx tsx scripts/create-admin.ts you@example.com "Your Name" 98XXXXXXXX
```
Open the link it prints and choose a strong password. Then sign in at `/admin/login`; a code
is texted to that phone. (Use this instead of the demo seed -- the seed uses a known password.)

## 7. Backups (do this on day one)
```bash
chmod +x scripts/backup.sh && ./scripts/backup.sh          # test it once
crontab -e    # add:   0 2 * * * /home/ubuntu/school/scripts/backup.sh
```
Backups land in `backups/` (14 days kept). **Also copy them off the server** (another cloud
drive, e.g. with `rclone`) -- a backup on the same machine is lost with the machine.

Restore the database: `gunzip -c backups/db_X.sql.gz | docker compose exec -T db mysql -uroot -p"ROOT_PASSWORD" school_portal`

## 8. Updating the site later
```bash
cd school && git pull && docker compose up -d --build
```

## SMS for admin codes
Admins sign in with a password plus an SMS code, and `SMS_PROVIDER=console` is refused in
production, so a real SMS provider must be configured or admins cannot sign in. Twilio is built
in (fill the `TWILIO_*` lines). SMS to Indian numbers needs the sender and message template
registered under India's **DLT** rules, which can take days -- start that early. Ask for another
provider (MSG91, Fast2SMS) or an authenticator-app option if that suits better.

## Useful commands
- Status: `docker compose ps`   Logs: `docker compose logs --tail 100 app`
- Restart: `docker compose restart app`
- Unlock/replace an admin's phone: `docker compose exec app npx tsx scripts/set-admin-phone.ts admin@email 98XXXXXXXX`
