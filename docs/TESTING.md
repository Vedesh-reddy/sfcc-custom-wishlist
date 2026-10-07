# Testing and validation

[← README](../README.md) · [Code reference](CODE-REFERENCE.md)

## Repeatable local checks

```sh
npm ci
npm run validate          # lint (JS, ISML, docs links) + tests + build
npm run package:metadata  # dist/custom-wishlist-metadata.zip
```

CI runs the same commands on Node 22 and 24 for every push to `main` or `feature/**` and every pull request.

## Unit suite — 6 tests

`test/unit/plugin_customwishlist/priceDropCheck.js` loads the real job and storage service with `proxyquire`, mocking `dw.*` modules, the wish list iterator, and `emailHelpers`.

| Test | Verifies |
| --- | --- |
| Flags a drop and sends one email per list | Drop flagged, last notified price set, unchanged item untouched, one email with the dropped item only |
| Does not re-notify the same price, but notifies a further drop | Repeat suppression and the moving baseline |
| Skips currency mismatches, missing prices and offline products | No flag, no email |
| Uses the lowest variant price for an unpriced master | `minPrice` fallback |
| Keeps the popup flag when email fails and reports ERROR | Flag committed before mail; other lists still processed; step status `ERROR` |
| Flags the popup without emailing when the profile has no email | Popup still works |

Platform behavior the mocks cannot prove: price-book resolution, product list queries, transactions, mail delivery, remote includes, and metadata import. Those were checked on a sandbox.

## Browser and sandbox evidence

Verified on sandbox `zyeu-002`, site `RefArch_Practice`, SFRA 8 with Bootstrap 5, on October 7, 2026. The storefront screenshots were captured with headless Chrome driven by WebdriverIO; the Business Manager and email screenshots were supplied by the author.

| Step | Evidence |
| --- | --- |
| Guest button | [wishlist-pdp-guest.png](images/wishlist-pdp-guest.png) |
| Variant selected, Add to wishlist | [wishlist-pdp-add.png](images/wishlist-pdp-add.png) |
| Wishlist after add, $135.00 | [wishlist-page.png](images/wishlist-page.png) |
| Price book before and after | [bm-price-book-before.png](images/bm-price-book-before.png), [bm-price-book-after.png](images/bm-price-book-after.png) |
| Job run OK, log `1 emailed, 0 failed` | [bm-job-run.png](images/bm-job-run.png), [bm-job-log.png](images/bm-job-log.png) |
| Email $135.00 → $99.00 | [price-drop-email.png](images/price-drop-email.png) |
| Popup after re-login | [price-drop-popup.png](images/price-drop-popup.png) |
| Price dropped badge | [wishlist-price-dropped.png](images/wishlist-price-dropped.png) |

During sandbox testing, adding a master with no size selected showed "Price unavailable", because masters are rarely priced themselves. The `minPrice` fallback and its unit test came from that run.

## Sandbox acceptance checklist

- [ ] Guest sees **Sign in to save to wishlist**; signed-in shopper sees **Add to wishlist**.
- [ ] Selecting a variant then adding saves that variant ID.
- [ ] Wishlist shows price when added and current price; Remove deletes the item.
- [ ] Lower the price and run the job: status `OK`, email received.
- [ ] Run the job again without changing the price: no second email.
- [ ] Sign out and in: popup appears once; reload: no popup.
- [ ] Product page is still served from cache (button loads through a remote include).
