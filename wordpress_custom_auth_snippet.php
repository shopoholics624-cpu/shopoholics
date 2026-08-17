/**
 * Shop-O-Holics Customer REST Authentication Snippet for WordPress Code Snippets
 * 
 * Target Endpoint: POST /wp-json/shopoholics/v1/login
 * Note: Do NOT include opening <?php tag when pasting into WordPress Code Snippets plugin.
 */

add_action('rest_api_init', function () {
    register_rest_route('shopoholics/v1', '/login', array(
        'methods'             => 'POST',
        'callback'            => 'shopoholics_handle_customer_login',
        'permission_callback' => '__return_true'
    ));
});

function shopoholics_handle_customer_login($request) {
    // 1. Accept ONLY Email Address & Password
    $raw_email = $request->get_param('email');
    $password  = $request->get_param('password');

    // Generic Failure Response (HTTP 401)
    $generic_error = new WP_Error(
        'invalid_credentials',
        'Invalid email address or password.',
        array('status' => 401)
    );

    if (empty($raw_email) || empty($password) || !is_email($raw_email)) {
        return $generic_error;
    }

    $email = strtolower(trim(sanitize_email($raw_email)));

    // 2. Client IP & Brute-Force Rate Limiting (5 failed attempts per 15-minute window)
    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '0.0.0.0';
    $rate_limit_key = 'shopoh_auth_' . md5($ip . '_' . $email);
    $attempts = (int) get_transient($rate_limit_key);

    if ($attempts >= 5) {
        return new WP_Error(
            'rate_limited',
            'Too many login attempts. Please try again later.',
            array('status' => 429)
        );
    }

    // 3. User Lookup ONLY by Email (No Username Fallback)
    $user = get_user_by('email', $email);

    if (!$user) {
        set_transient($rate_limit_key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
        return $generic_error;
    }

    // 4. Role Whitelist: Allow standard storefront roles (customer, administrator, shop_manager, subscriber)
    $user_roles = (array) $user->roles;
    $allowed_roles = array('customer', 'administrator', 'shop_manager', 'subscriber');

    if (!array_intersect($allowed_roles, $user_roles)) {
        set_transient($rate_limit_key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
        return $generic_error;
    }

    // 5. WordPress Native Password Verification
    if (!wp_check_password($password, $user->user_pass, $user->ID)) {
        set_transient($rate_limit_key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
        return $generic_error;
    }

    // 6. Successful Authentication -> Reset Rate Limit Transient
    delete_transient($rate_limit_key);

    // 7. Return Safe WooCommerce Customer Payload (NO PASSWORDS, HASHES, NONCES, OR SECRETS)
    return array(
        'success'      => true,
        'customer_id'  => (int) $user->ID,
        'email'        => (string) $user->user_email,
        'first_name'   => (string) get_user_meta($user->ID, 'first_name', true) ?: $user->display_name,
        'last_name'    => (string) get_user_meta($user->ID, 'last_name', true) ?: '',
        'display_name' => (string) $user->display_name ?: $user->user_email,
    );
}
