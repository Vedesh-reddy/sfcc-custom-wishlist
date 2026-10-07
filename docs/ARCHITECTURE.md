# Architecture and data model

[← README](../README.md) · [Code reference](CODE-REFERENCE.md)

## Request flow

```text
Product page (cacheable)
  addToCartButtonExtension.isml
    └─ <isinclude url="CustomWishlist-Button?pid=…">   remote include, never cached
         ├─ guest:     link to Login-Show
         └─ signed in: form → POST CustomWishlist-Add (pid, CSRF token)
                         └─ customWishlist.addProduct → redirect CustomWishlist-Show

CustomWishlist-Show (HTTPS, signed in)   → wishlist/page.isml
POST CustomWishlist-Remove (HTTPS, CSRF) → customWishlist.removeItem → redirect Show

Every page using common/layout/page.isml (cacheable)
  app.template.afterFooter hook
    └─ Velocity remoteInclude CustomWishlist-Alert     never cached
         ├─ guest, or already checked this session → empty
         └─ first page after sign-in → takePendingAlerts → wishlist/priceAlert.isml

Job CustomWishlist-PriceDropCheck (site scope)
  ProductListMgr.queryProductLists('type = {0}', TYPE_WISH_LIST)
    └─ per list: Transaction { flagPriceDrop per online item } → emailHelpers.sendEmail
```

## Data model

Storage is the native customer wish list, one per customer (`dw.customer.ProductList`, `TYPE_WISH_LIST`). It is created on the first add. Each saved product is a `ProductListItem` with four custom attributes:

| Attribute | Type | Written by | Meaning |
| --- | --- | --- | --- |
| `wishlistAddedPrice` | double | Add | Price when added |
| `wishlistPriceCurrency` | string | Add | Currency of that price |
| `wishlistLastNotifiedPrice` | double | Job | Lowest price already reported |
| `wishlistPriceAlertPending` | boolean | Job sets, Alert clears | Popup waiting |

Using the platform list keeps the data with the customer: it is removed with the customer, appears in standard APIs, and is compatible with other wish list features.

## Price rules

`currentPrice(product)` returns `product.priceModel.price` from the applicable price books. A master without its own price falls back to `priceModel.minPrice`, matching the product page's lowest price. Promotions are not applied.

A drop is flagged when all of these hold:

1. The product is online and has an available price.
2. The price currency equals `wishlistPriceCurrency`.
3. The price is below the baseline: `wishlistLastNotifiedPrice`, or `wishlistAddedPrice` if nothing was reported yet.

Flagging sets `wishlistLastNotifiedPrice` to the new price and `wishlistPriceAlertPending` to `true`. Re-adding a saved product keeps the original added price.

## Job failure semantics

Each list is processed independently. Flags are committed in a transaction **before** the email is sent:

- Mail failure: the popup still appears, and the same drop is never emailed twice.
- A list that throws is counted and logged; other lists continue. The step returns `ERROR` if any list failed.
- The query iterator is closed in `finally`.

## Cache and session boundaries

The product page and every layout page stay cacheable. Personal output is only in remote includes that set `cachePeriod = 0` and an expired `Expires` header: the button (CSRF token, sign-in state) and the alert (customer's items).

The alert checks once per signed-in session using `session.privacyCache` key `wishlistAlertChecked`. Logout clears the privacy cache, so the next sign-in checks again. Guests never set the key.

## Trust boundaries

- The customer is always `req.currentCustomer.raw`, and must be authenticated and registered. No customer identifier is accepted from the browser.
- `Add` and `Remove` are HTTPS POSTs validated by SFRA `csrf.validateRequest`. That middleware redirects and logs out on failure but continues the chain, so both handlers stop when a redirect is already set.
- `Remove` looks the item up with `list.getItem(id)` on the customer's own list; foreign item IDs are ignored.
- `Add` accepts only online products from `ProductMgr`.
- `Button` and `Alert` use `server.middleware.include`; direct requests are rejected.
- Templates use ISML default encoding for all values.

## Logging

`Logger.getLogger('custom-wishlist', <category>)`:

| Category | Source |
| --- | --- |
| `wishlist-storefront` | Add, remove, and alert lookup failures |
| `price-drop-job` | Per-list failures and the run summary |
