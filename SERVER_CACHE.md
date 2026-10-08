# Browser caching on a self-hosted server

This static site works on Nginx without a CDN, Service Worker, or platform-specific configuration. Keep `index.html` revalidated so a new release can reference the new asset versions. Only cache immutable asset URLs for a long time.

The existing `?v=...` convention is the release identifier. Whenever the bytes of a versioned file change, give **every reference to that file** a new version, including dynamically inserted scripts/styles, font URLs, and preload URLs. Never overwrite the bytes served at an old versioned URL while clients still use it. Deploy each release atomically; keep older release files addressable if old pages remain open. The sample routes version queries to separate release directories so an old URL continues to return its original bytes. If the server cannot retain old releases, use content-fingerprinted filenames instead or remove the version-query cache rule and use revalidation for those assets. Changing a query alone does not make Nginx keep older file contents.

Unversioned artwork and JSON in this project deliberately use revalidation, not a year-long cache. Their names can stay the same across releases. The original unused OTF/TTF files can be retained for source/reference purposes; the live font URLs use WOFF2.

## Nginx example

Put this `map` in the `http` context, outside the `server` block. It covers JS, CSS, WOFF2, WebP, PNG, AVIF, GIF, SVG, and JSON. The filename pattern recognizes a hexadecimal content hash of at least eight characters immediately before the extension. Use that pattern only for genuinely content-fingerprinted files.

```nginx
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    map "$uri:$arg_v" $portfolio_asset_cache {
        default "no-cache";
        # A release/version query. See the immutable URL rule above.
        "~*\.(?:js|css|woff2|webp|png|avif|gif|svg|json):[a-z0-9_-]{1,64}$" "public, max-age=31536000, immutable";
        # A content-fingerprinted filename, with or without a query.
        "~*\.[a-f0-9]{8,}\.(?:js|css|woff2|webp|png|avif|gif|svg|json):" "public, max-age=31536000, immutable";
    }

    # Release queries resolve to their own immutable copy of dist.
    map $arg_v $portfolio_asset_root {
        default /srv/portfolio/current/dist;
        "~^[A-Za-z0-9_-]{1,64}$" /srv/portfolio/releases/$arg_v/dist;
    }

    server {
        listen 80;
        server_name portfolio.example.com;
        root /srv/portfolio/current/dist;
        index index.html;
        etag on;

        location = / {
            try_files /index.html =404;
            add_header Cache-Control "no-cache";
        }

        location ~* \.html$ {
            try_files $uri =404;
            add_header Cache-Control "no-cache";
        }

        location ~* \.(?:js|css|woff2|webp|png|avif|gif|svg|json)$ {
            root $portfolio_asset_root;
            try_files $uri =404;
            add_header Cache-Control $portfolio_asset_cache;
        }

        location / {
            try_files $uri $uri/ =404;
            add_header Cache-Control "no-cache";
        }
    }
}
```

The sample intentionally does not add `always` to the cache header: a missing asset must not receive a one-year cache policy. Do not add another `expires` directive or overlapping `Cache-Control` header. Ensure your MIME table contains `font/woff2`, `image/avif`, `image/webp`, and `application/json`. Adapt the hostname, directory, and your existing HTTPS configuration to the actual server.

`no-cache` permits storage but requires validation before reuse. Nginx's ETag/Last-Modified responses allow a `304 Not Modified` without transferring unchanged bytes. A new HTML release is therefore discovered on refresh. An unversioned asset is also revalidated rather than silently staying stale.

## Release and checks

1. Publish files atomically. Update `index.html` and its release query only after the referenced files exist.
2. For this example, copy a complete release to `/srv/portfolio/releases/load-20261008/dist` and point `/srv/portfolio/current` to `/srv/portfolio/releases/load-20261008`. Keep previous release directories. All version identifiers referenced in HTML or CSS need corresponding directories, including existing identifiers for unchanged files. For a simple server that overwrites files, prefer fingerprinted filenames; remove the version-query map entry and the asset-root map/routing until release retention is implemented.
3. Inspect response headers:

```sh
curl -I https://portfolio.example.com/
curl -I https://portfolio.example.com/index.html
curl -I 'https://portfolio.example.com/entry.js?v=load-20261008'
curl -I https://portfolio.example.com/assets/category-scenes.webp
curl -I 'https://portfolio.example.com/missing.js?v=load-20261008'
```

HTML and unversioned artwork should return `Cache-Control: no-cache`. An immutable versioned/fingerprinted asset should return `public, max-age=31536000, immutable`. Missing files should return `404` without the immutable header. After publishing a new version, confirm that HTML refers to its new URLs and that an old immutable URL still returns its original bytes.
