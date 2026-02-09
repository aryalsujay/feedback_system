# Sudo Setup for Deploy Button

To enable the "Deploy" button in the admin panel to work without manual intervention, you need to configure passwordless sudo for the `feedback` user.

## Setup Instructions

Run this command as a user with sudo privileges (or root):

```bash
# Create sudoers file for feedback user
sudo bash -c 'cat > /etc/sudoers.d/feedback-system << EOF
# Allow feedback user to restart the feedback system service without password
feedback ALL=(ALL) NOPASSWD: /bin/systemctl restart feedback-system.service
feedback ALL=(ALL) NOPASSWD: /bin/systemctl stop feedback-system.service
feedback ALL=(ALL) NOPASSWD: /bin/systemctl start feedback-system.service
feedback ALL=(ALL) NOPASSWD: /bin/systemctl status feedback-system.service
EOF'

# Set correct permissions
sudo chmod 0440 /etc/sudoers.d/feedback-system

# Validate sudoers configuration
sudo visudo -c
```

## Verification

Test that sudo works without password:

```bash
sudo systemctl status feedback-system.service
```

This should work without asking for a password.

## After Setup

Once configured:
- The **Deploy** button in admin panel will work
- The `deploy.sh` script will work automatically
- The `restart-server.sh` script will work automatically

## Security Note

This configuration only allows the `feedback` user to control the `feedback-system.service` and nothing else. This is a safe and limited permission scope.
