<?php

/*
 * Which websites may call this API from the browser.
 *
 * CORS_ALLOWED_ORIGINS is a comma-separated list, for example:
 *   http://localhost:5173,https://hotel-pms.vercel.app
 * No trailing slashes. The Vite dev server (localhost:5173) is the default.
 */

$origins = array_filter(array_map(
    fn ($origin) => rtrim(trim($origin), '/'),
    explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'))
));

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'OPTIONS'],

    'allowed_origins' => array_values($origins),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,
];
