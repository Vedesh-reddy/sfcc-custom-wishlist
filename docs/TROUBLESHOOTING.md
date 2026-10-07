# Troubleshooting

[← README](../README.md) · [Installation](INSTALLATION.md)

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `CustomWishlist-Show` returns the error page | Cartridge not on the site's path, wrong site, or code version not active | Check **Manage Sites → your site → Settings**, and **Code Deployment** |
| `CustomWishlist-Button` or `-Alert` errors when opened directly | Expected: both accept only remote includes | Test them through a product page or any layout page |
| No button on the product page | Another cartridge ahead overrides `addToCartButtonExtension.isml`, or the page is cached from before deployment | Include `CustomWishlist-Button` from that template; clear the page cache |
| Step type missing when importing or creating the job | `steptypes.json` not deployed, or the cartridge is not on the site's path | Deploy it at the cartridge root, set the path, import again |
| Job import fails for the site | `site-id` in `jobs.xml` does not match | Set your site ID and rebuild the ZIP |
| "Price unavailable" on the wishlist | The product has no price in the applicable price books | Price the variant or master; masters fall back to their lowest variant price |
| Add does nothing; `custom-wishlist` log shows an attribute error | Metadata not imported | Import the ZIP and check **ProductListItem** attributes |
| Job `OK` but no email | No drop below the baseline, the profile has no email, or mail is blocked | Check the summary line (`n emailed`), the profile, and the instance's mail settings |
| Same drop, no second email | Expected: each lower price is reported once | Lower the price below the last reported price |
| Job never runs on a sandbox | Sandboxes disable scheduled custom jobs | Use **Run Now** |
| Popup does not appear | Already shown this session, the flag was already cleared, or the page does not use `common/layout/page` | Sign out and in after a new drop; the hook only runs on layouts that call `app.template.afterFooter` |
| Sign-in returns to My Account, not the wishlist | Login return is not customized | Open the wishlist from the popup, email, or product page |

## Diagnosis order

1. Route reachable: `CustomWishlist-Show` redirects guests to `Login-Show`.
2. Metadata present: four `ProductListItem` attributes and the job.
3. Logs: **Administration → Site Development → Development Setup → Log Files**, file prefix `custom-wishlist`, categories `wishlist-storefront` and `price-drop-job`.
4. Job history: status and the `Wishlist price check finished` line.
5. Business Manager price: the variant's Pricing tab shows the price the job sees.
