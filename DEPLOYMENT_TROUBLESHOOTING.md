# Deployment Troubleshooting Guide

## Current Issue: SSH Authentication Failure

The deployment is failing with the error:

```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

## Quick Fixes to Try

### 1. Check GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Ensure these secrets are properly set:

- **HOST**: Your server's IP address or domain name
- **USERNAME**: The SSH username (commonly `root`, `ubuntu`, or your custom user)
- **SSH_KEY**: Your complete private SSH key
- **PASSWORD**: (Optional) Server password as fallback

### 2. SSH Key Format Verification

Your `SSH_KEY` secret should include the complete private key with headers:

**For OpenSSH format:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn...
[multiple lines of key content]
...AAAAEc3NoOmRzYUBkZXNrdG9wLWFiY2RlZmc=
-----END OPENSSH PRIVATE KEY-----
```

**For RSA format:**

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
[multiple lines of key content]
...1234567890abcdef
-----END RSA PRIVATE KEY-----
```

### 3. Generate New SSH Key Pair (If Needed)

If you need to create a new SSH key:

```bash
# Generate Ed25519 key (recommended)
ssh-keygen -t ed25519 -C "github-actions@yourdomain.com" -f ~/.ssh/github_actions

# Or generate RSA key (if Ed25519 not supported)
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/github_actions
```

### 4. Add Public Key to Server

Copy the public key to your server:

```bash
# Copy public key content
cat ~/.ssh/github_actions.pub

# On your server, add it to authorized_keys
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 5. Test SSH Connection Locally

Before using in GitHub Actions, test the connection:

```bash
ssh -i ~/.ssh/github_actions username@your-server-ip
```

### 6. Server SSH Configuration Check

On your server, check SSH configuration:

```bash
# Check SSH config
sudo nano /etc/ssh/sshd_config

# Ensure these settings allow key authentication:
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication yes  # For fallback
```

Restart SSH service after changes:

```bash
sudo systemctl restart ssh
```

## Alternative: Password Authentication

If SSH key continues to fail, you can temporarily use password authentication by adding the `PASSWORD` secret to your GitHub repository.

## Debugging Steps

The updated workflow now includes:

- Debug mode enabled
- Extended timeouts
- Better error messages
- Directory existence checks
- PM2 status reporting

## Common Issues and Solutions

### Issue: "Permission denied (publickey)"

- **Solution**: Check if the public key is properly added to `~/.ssh/authorized_keys` on the server

### Issue: "Host key verification failed"

- **Solution**: Add `StrictHostKeyChecking no` to SSH config or add the host to known_hosts

### Issue: "Connection timed out"

- **Solution**: Check if the server IP/domain is correct and accessible

### Issue: "Directory not found"

- **Solution**: Ensure `/var/www/expo-app` exists on the server

### Issue: "command not found: bun"

- **Solution**: Bun is not installed on the server. The updated workflow now automatically installs Bun if missing, or you can manually install it:

```bash
# SSH into your server and run:
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or restart your shell
```

## Next Steps

1. **Verify GitHub Secrets**: Double-check all secret values
2. **Test SSH Connection**: Try connecting manually first
3. **Check Server Logs**: Look at `/var/log/auth.log` for SSH authentication attempts
4. **Run Updated Workflow**: The enhanced workflow will provide more debugging information

## Contact Information

If issues persist, check:

- Server SSH logs: `sudo tail -f /var/log/auth.log`
- GitHub Actions logs for detailed error messages
- Server accessibility: `ping your-server-ip`
