<?php
/**
 * Plugin Name: Majestic Booking Widget
 * Plugin URI: https://majestic-south.fr
 * Description: Embed Majestic South Chauffeurs booking widget on your WordPress site
 * Version: 1.0.0
 * Author: Majestic South Chauffeurs
 * Author URI: https://majestic-south.fr
 * License: GPL v2 or later
 * Text Domain: majestic-booking
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MAJESTIC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MAJESTIC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MAJESTIC_VERSION', '1.0.0');

// Admin menu
add_action('admin_menu', 'majestic_add_admin_menu');
function majestic_add_admin_menu() {
    add_options_page(
        'Majestic Booking Settings',
        'Majestic Booking',
        'manage_options',
        'majestic-booking',
        'majestic_admin_page'
    );
}

// Admin page
function majestic_admin_page() {
    if (isset($_POST['submit']) && check_admin_referer('majestic_nonce')) {
        update_option('majestic_platform_url', sanitize_url($_POST['majestic_platform_url']));
        update_option('majestic_api_key', sanitize_text_field($_POST['majestic_api_key']));
        echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
    }

    $platform_url = get_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    $api_key = get_option('majestic_api_key', '');
    ?>
    <div class="wrap">
        <h1>Majestic Booking Configuration</h1>
        
        <div style="max-width: 600px; margin: 20px 0;">
            <form method="post">
                <?php wp_nonce_field('majestic_nonce'); ?>
                
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
                                value="<?php echo esc_attr($platform_url); ?>"
                                class="regular-text"
                                required
                            />
                            <p class="description">
                                The URL where your Majestic platform is hosted (e.g., https://booking.majestic-south.fr)
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="api_key">API Key (Optional)</label>
                        </th>
                        <td>
                            <input 
                                type="password" 
                                id="api_key" 
                                name="majestic_api_key" 
                                value="<?php echo esc_attr($api_key); ?>"
                                class="regular-text"
                            />
                            <p class="description">
                                API key for server-to-server communication (leave empty for client-side only)
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 30px;">
            <h2>How to Use</h2>
            <p>Add the booking widget to any page or post using the shortcode:</p>
            <code style="display: block; background: white; padding: 10px; margin: 10px 0; border-left: 3px solid #0073aa;">
                [majestic_booking]
            </code>
            
            <h3>Available Shortcodes:</h3>
            <ul>
                <li><code>[majestic_booking]</code> - Full booking widget</li>
                <li><code>[majestic_client_portal]</code> - Client portal (login required)</li>
                <li><code>[majestic_tracking]</code> - Mission tracking widget</li>
            </ul>

            <h3>Customization:</h3>
            <ul>
                <li><code>[majestic_booking height="800"]</code> - Custom height</li>
                <li><code>[majestic_booking width="100%"]</code> - Custom width</li>
            </ul>
        </div>
    </div>
    <?php
}

// Register settings
add_action('admin_init', function() {
    register_setting('majestic_booking_settings', 'majestic_platform_url');
    register_setting('majestic_booking_settings', 'majestic_api_key');
});

// Shortcode: [majestic_booking]
add_shortcode('majestic_booking', function($atts) {
    $atts = shortcode_atts(array(
        'height' => '600',
        'width' => '100%',
    ), $atts);

    $platform_url = get_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    
    return sprintf(
        '<iframe src="%s/client-portal" style="width:%s; height:%s; border:none; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" allow="geolocation" title="Majestic Booking"></iframe>',
        esc_url($platform_url),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
});

// Shortcode: [majestic_client_portal]
add_shortcode('majestic_client_portal', function($atts) {
    $atts = shortcode_atts(array(
        'height' => '800',
        'width' => '100%',
    ), $atts);

    $platform_url = get_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    
    return sprintf(
        '<iframe src="%s/client-portal" style="width:%s; height:%s; border:none; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" allow="geolocation" title="Client Portal"></iframe>',
        esc_url($platform_url),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
});

// Shortcode: [majestic_tracking]
add_shortcode('majestic_tracking', function($atts) {
    $atts = shortcode_atts(array(
        'height' => '400',
        'width' => '100%',
    ), $atts);

    $platform_url = get_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    
    return sprintf(
        '<iframe src="%s/mission-tracking" style="width:%s; height:%s; border:none; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" allow="geolocation" title="Mission Tracking"></iframe>',
        esc_url($platform_url),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
});

// Enqueue admin styles
add_action('admin_enqueue_scripts', function($hook) {
    if ('settings_page_majestic-booking' !== $hook) {
        return;
    }
    
    wp_enqueue_style('majestic-admin', MAJESTIC_PLUGIN_URL . 'css/admin.css', array(), MAJESTIC_VERSION);
});

// Plugin activation
register_activation_hook(__FILE__, function() {
    // Set default options
    if (!get_option('majestic_platform_url')) {
        update_option('majestic_platform_url', 'https://booking.majestic-south.fr');
    }
});

// Plugin deactivation
register_deactivation_hook(__FILE__, function() {
    // Cleanup if needed
});
?>
