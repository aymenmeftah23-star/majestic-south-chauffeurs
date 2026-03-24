# WordPress Integration Guide - Majestic South Chauffeurs

## Overview

The Majestic South Chauffeurs platform can be integrated with WordPress to provide a seamless booking experience for your clients. This guide explains how to set up the integration and deploy the platform.

## Architecture

The platform is built as a standalone web application that can be deployed independently or integrated with WordPress through:

1. **Embedded Booking Widget** - A lightweight iframe that can be embedded on any WordPress page
2. **API Integration** - Direct API calls from WordPress plugins to the platform backend
3. **Standalone Deployment** - Full platform accessible at a custom domain

## Deployment Options

### Option 1: Manus Hosting (Recommended)

The platform is already configured for deployment on Manus with built-in hosting:

**Advantages:**
- Zero configuration required
- Automatic SSL/TLS certificates
- Built-in database and backup
- Custom domain support
- Automatic scaling
- No server management

**Steps:**
1. Click the "Publish" button in the Manus Management UI
2. Choose your custom domain (e.g., booking.majestic-south.fr)
3. Your platform is live immediately

### Option 2: Traditional Hosting (WordPress Server)

If you want to host on your existing WordPress server:

**Requirements:**
- Node.js 18+ on your server
- MySQL 8.0+ or compatible database
- Nginx or Apache with reverse proxy support
- SSL certificate

**Installation Steps:**

```bash
# 1. Clone the project
git clone <your-repo-url> /var/www/majestic-south
cd /var/www/majestic-south

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Set environment variables
cp .env.example .env
# Edit .env with your database and OAuth credentials

# 5. Run migrations
pnpm db:push

# 6. Start the server
pnpm start
```

**Nginx Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name booking.majestic-south.fr;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Docker Deployment

Deploy using Docker for easier management:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

**Docker Compose:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://user:password@db:3306/majestic
      JWT_SECRET: your-secret-key
      VITE_APP_ID: your-app-id
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: majestic
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

## WordPress Plugin Integration

### Booking Widget Plugin

Create a WordPress plugin to embed the booking widget:

**File: wp-content/plugins/majestic-booking/majestic-booking.php**

```php
<?php
/**
 * Plugin Name: Majestic Booking Widget
 * Description: Embed Majestic South Chauffeurs booking widget
 * Version: 1.0.0
 */

// Shortcode: [majestic_booking]
add_shortcode('majestic_booking', function() {
    $platform_url = get_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    
    return sprintf(
        '<iframe src="%s/client-portal" style="width:100%%; height:600px; border:none; border-radius:8px;" allow="geolocation"></iframe>',
        esc_url($platform_url)
    );
});

// Admin settings page
add_action('admin_menu', function() {
    add_options_page(
        'Majestic Booking Settings',
        'Majestic Booking',
        'manage_options',
        'majestic-booking',
        function() {
            ?>
            <div class="wrap">
                <h1>Majestic Booking Configuration</h1>
                <form method="post" action="options.php">
                    <?php settings_fields('majestic_booking_settings'); ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="platform_url">Platform URL</label>
                            </th>
                            <td>
                                <input 
                                    type="url" 
                                    id="platform_url" 
                                    name="majestic_platform_url" 
                                    value="<?php echo esc_attr(get_option('majestic_platform_url')); ?>"
                                    class="regular-text"
                                />
                            </td>
                        </tr>
                    </table>
                    <?php submit_button(); ?>
                </form>
            </div>
            <?php
        }
    );
});

register_setting('majestic_booking_settings', 'majestic_platform_url');
```

### Usage in WordPress

1. Install the plugin in WordPress
2. Configure the platform URL in Settings > Majestic Booking
3. Add the shortcode to any page: `[majestic_booking]`

## API Integration

### Client Portal Endpoints

**Authentication:**
```
POST /api/trpc/auth.login
POST /api/trpc/auth.logout
GET /api/trpc/auth.me
```

**Missions:**
```
GET /api/trpc/missions.list
GET /api/trpc/missions.getById
POST /api/trpc/missions.create
```

**Quotes:**
```
GET /api/trpc/quotes.list
POST /api/trpc/quotes.create
```

### Example: WordPress Integration with API

```php
<?php
function get_client_missions($client_id) {
    $platform_url = get_option('majestic_platform_url');
    $api_key = get_option('majestic_api_key');
    
    $response = wp_remote_post(
        $platform_url . '/api/trpc/missions.list',
        array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array('clientId' => $client_id)),
        )
    );
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
?>
```

## Bilingual Support

The platform supports French and English. Language preference is stored in the user profile and can be set via:

1. **User Interface** - Language switcher in the sidebar (FR/EN)
2. **Database** - `users.language` field
3. **API** - Pass `language` parameter in requests

### Translating Content

All UI strings are managed in `shared/i18n.ts`. To add new translations:

```typescript
export const translations: Record<Language, Record<string, string>> = {
  fr: {
    'your.key': 'Votre texte en français',
  },
  en: {
    'your.key': 'Your text in English',
  },
};
```

## Client Portal

The client portal is accessible at `/client-portal` and provides:

- Mission tracking and history
- Quote viewing and acceptance
- Profile management
- Notification center
- Booking form

### Accessing the Client Portal

1. **Direct URL**: `https://booking.majestic-south.fr/client-portal`
2. **WordPress Shortcode**: `[majestic_client_portal]`
3. **Embedded Widget**: Use the booking widget iframe

## Security Considerations

### CORS Configuration

The platform is configured to accept requests from WordPress domains:

```typescript
// server/_core/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
```

### Environment Variables

Set these in your deployment:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/majestic

# OAuth (Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your-secret-key

# CORS
ALLOWED_ORIGINS=https://your-wordpress.com,https://booking.majestic-south.fr

# Platform
VITE_APP_TITLE=Majestic South Chauffeurs
VITE_APP_LOGO=https://cdn.../logo.png
```

### SSL/TLS

Always use HTTPS for:
- Platform deployment
- WordPress integration
- API calls

## Monitoring & Maintenance

### Health Check

```bash
curl https://booking.majestic-south.fr/api/health
```

### Logs

Access logs in the Manus Management UI:
- `.manus-logs/devserver.log` - Server logs
- `.manus-logs/browserConsole.log` - Client errors
- `.manus-logs/networkRequests.log` - API calls

### Backups

Manus automatically backs up your database daily. To restore:

1. Go to Manus Management UI > Database
2. Click "Restore" on a previous backup
3. Confirm the restoration

## Troubleshooting

### Widget Not Loading

**Check:**
1. Platform URL is correct
2. CORS is properly configured
3. SSL certificate is valid
4. Firewall allows requests

### Database Connection Issues

**Check:**
1. DATABASE_URL is correct
2. Database server is running
3. User has proper permissions
4. Network connectivity

### OAuth Not Working

**Check:**
1. VITE_APP_ID is set correctly
2. OAuth redirect URL matches configuration
3. JWT_SECRET is set
4. OAuth server is reachable

## Support

For issues or questions:

1. Check the logs in Manus Management UI
2. Review this documentation
3. Contact Manus support at https://help.manus.im

## Next Steps

1. Deploy the platform using one of the options above
2. Configure WordPress integration
3. Test the booking flow
4. Train your team
5. Launch to clients

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Platform**: Majestic South Chauffeurs
