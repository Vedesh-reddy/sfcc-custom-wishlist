# Code reference

[← README](../README.md) · [Architecture](ARCHITECTURE.md) · [Testing](TESTING.md)

All paths are relative to `cartridges/plugin_customwishlist`.

## Storage service

`cartridge/scripts/customWishlist.js`. Server-side module over `dw.customer.ProductListMgr`.

| Export | Signature | Behavior |
| --- | --- | --- |
| `getProduct` | `(pid) → Product \| null` | `ProductMgr.getProduct(String(pid))`; returns `null` for empty, unknown, or offline products. |
| `addProduct` | `(customer, product)` | In one transaction: gets or creates the customer's wish list, and if the product is not already saved, creates an item with `wishlistAddedPrice` and `wishlistPriceCurrency`. Re-adding is a no-op. |
| `removeItem` | `(customer, itemID)` | Finds the item with `list.getItem(itemID)` on the customer's own list and removes it in a transaction. Unknown or foreign IDs do nothing. |
| `getItems` | `(customer) → Object[]` | View models for online items; empty when there is no list. |
| `takePendingAlerts` | `(customer) → Object[]` | View models for online items with `wishlistPriceAlertPending`, and clears the flag in one transaction. |
| `onlineItems` | `(list) → ProductListItem[]` | Items whose product exists and is online. |
| `flagPriceDrop` | `(item) → boolean` | Caller owns the transaction. Flags a drop and updates `wishlistLastNotifiedPrice` when the [price rules](ARCHITECTURE.md#price-rules) hold. |
| `toViewModel` | `(item) → Object` | Shared by the page, popup, and email. |

### Internal helpers

| Function | Purpose |
| --- | --- |
| `getList(customer, create)` | First wish list of the customer; creates one when `create` is true (inside the caller's transaction). |
| `currentPrice(product)` | `priceModel.price`, or `priceModel.minPrice` for an unpriced master; `null` when not available. |
| `baseline(item)` | `wishlistLastNotifiedPrice`, else `wishlistAddedPrice`, else `null`. |
| `format(value, currency)` | `new Money(value, currency).toFormattedString()`. |

### View model

| Field | Type | Source |
| --- | --- | --- |
| `id` | string | `ProductListItem.ID`, used by Remove |
| `pid` | string | Product ID |
| `name` | string | Product name |
| `url` | string | `URLUtils.https('Product-Show', 'pid', …)` |
| `image` | `{url, alt}` \| null | `product.getImage('small', 0)` |
| `addedPrice` | string \| null | Formatted added price |
| `currentPrice` | string \| null | Formatted current price |
| `dropped` | boolean | Same currency and current below added |

## Price-drop job

`cartridge/scripts/jobs/priceDropCheck.js`, registered in `steptypes.json` as `custom.CustomWishlist.PriceDropCheck` (site scope, not transactional, no parameters, timeout 3600 s).

| Function | Behavior |
| --- | --- |
| `execute() → Status` | Queries wish lists with `queryProductLists('type = {0}', null, ProductList.TYPE_WISH_LIST)`, runs `processList` for each, closes the iterator in `finally`, logs the summary, returns `OK` or `ERROR`. |
| `processList(list) → boolean` | Skips lists without a registered owner. Flags drops in one transaction, then sends one email to `profile.email` through `emailHelpers.sendEmail` with template `wishlist/priceDropEmail`. Returns whether an email was sent. |

Email context: `firstName`, `items` (view models), `wishlistUrl`. Email object `type` is `'wishlistPriceDrop'`, available to `app.customer.email` hook implementations.

## Controller

`cartridge/controllers/CustomWishlist.js`

| Route | Middleware | Behavior |
| --- | --- | --- |
| `GET Show` | https, csrf token | Signed-in: renders `wishlist/page` with `items`. Guest: redirects to `Login-Show`. Not cached. |
| `GET Button` | include, csrf token | Renders `wishlist/button` with `pid` and `loggedIn`. Not cached. |
| `POST Add` | https, csrf validate | Stops if CSRF already redirected. Adds `req.form.pid` for a signed-in shopper; redirects to `Show` or `Login-Show`. |
| `POST Remove` | https, csrf validate | Stops if CSRF already redirected. Removes `req.form.itemId`; redirects to `Show` or `Login-Show`. |
| `GET Alert` | include | Once per signed-in session (`privacyCache` key `wishlistAlertChecked`): renders `wishlist/priceAlert` with `alerts` and `wishlistUrl`, or prints an empty body. Not cached. |

Helpers: `noCache(res)` sets `cachePeriod = 0` and an expired `Expires` header; `authenticatedCustomer(req)` returns the authenticated, registered customer or `null`.

## Template hook

`hooks.json` registers `cartridge/scripts/hooks/afterFooter.js` for `app.template.afterFooter`. It writes a Velocity remote include of `CustomWishlist-Alert`, so the popup works on cached pages.

## Browser module

`cartridge/client/default/js/customWishlist.js`, built to `static/default/js/customWishlist.js`. Loaded by the button and the popup fragments; guarded by `window.customWishlistReady` so repeated script tags bind once.

- On submit of `.wishlist-add-form`, sets the `pid` field to `jQuery('.product-detail').data('pid')` from the closest product, which SFRA updates when a variant is selected.
- If `#wishlist-price-alert` exists and is not open, calls `showModal()`.

## Templates

| Template | Purpose |
| --- | --- |
| `product/components/addToCartButtonExtension.isml` | Replaces SFRA's empty extension point with the Button remote include |
| `wishlist/button.isml` | Add form with CSRF token, or the sign-in link |
| `wishlist/page.isml` | Wishlist page in `common/layout/page`, with Remove forms and the Price dropped badge |
| `wishlist/priceAlert.isml` | Native `<dialog>` labelled by its heading, with View wishlist and Close |
| `wishlist/priceDropEmail.isml` | HTML email |

## Localization and metadata

Text is in `cartridge/templates/resources/customwishlist.properties`. Metadata is in `metadata/custom-wishlist`; see [installation](INSTALLATION.md#4-import-the-metadata).

## Build, validation, and repository tooling

| File | Purpose |
| --- | --- |
| `scripts/build.js` | Webpack production build of the browser module |
| `scripts/check-templates.js` | isml-linter over all five templates; fails if the count changes |
| `scripts/check-docs.js` | Verifies every local Markdown link and image exists |
| `scripts/package-metadata.js` | Builds `dist/custom-wishlist-metadata.zip` |
| `.github/workflows/ci.yml` | `npm ci`, validate, and package on Node 22 and 24; uploads the static bundle and ZIP |
