# Majestic Booking Widget - WordPress Plugin

A lightweight WordPress plugin to embed the Majestic South Chauffeurs booking widget on your WordPress site.

## Installation

### Method 1: Upload to WordPress

1. Download the plugin folder
2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
3. Select the `majestic-booking` folder
4. Click "Install Now"
5. Activate the plugin

### Method 2: Manual Installation

1. Upload the `majestic-booking` folder to `/wp-content/plugins/`
2. Go to WordPress Admin > Plugins
3. Find "Majestic Booking Widget" and click "Activate"

## Configuration

1. Go to WordPress Admin > Settings > Majestic Booking
2. Enter your platform URL (e.g., `https://booking.majestic-south.fr`)
3. Optionally add an API key for server-to-server communication
4. Click "Save Changes"

## Usage

### Basic Booking Widget

Add this shortcode to any page or post:

```
[majestic_booking]
```

### Client Portal

For logged-in clients to view their missions:

```
[majestic_client_portal]
```

### Mission Tracking

For clients to track their current mission:

```
[majestic_tracking]
```

### Customization

Adjust the widget size:

```
[majestic_booking height="800" width="100%"]
```

## Features

- ✅ Responsive design
- ✅ Bilingual support (FR/EN)
- ✅ Easy configuration
- ✅ Multiple widget types
- ✅ Secure CORS handling
- ✅ No dependencies

## Requirements

- WordPress 5.0+
- PHP 7.4+
- HTTPS enabled

## Support

For issues or questions, visit:
https://help.manus.im

## License

GPL v2 or later
