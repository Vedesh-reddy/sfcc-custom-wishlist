# Installation

[← README](../README.md) · [Merchant guide](MERCHANT-GUIDE.md) · [Troubleshooting](TROUBLESHOOTING.md)

## Requirements

- An SFCC sandbox with an existing SFRA storefront and permission to upload code, import site data, edit the cartridge path, and run jobs.
- Node.js 22 or newer and npm for local tooling. Node runs the build and tests; SFCC runs the cartridge's server JavaScript.
- SFRA 8 with Bootstrap 5 classes was tested. The templates use only Bootstrap utilities and a native `<dialog>`.
- `app_storefront_base` and `modules` must stay on the path. The plugin uses the SFRA `server` module, `csrf` middleware, `emailHelpers`, the `common/layout/page` decorator, the `addToCartButtonExtension` extension point, the `app.template.afterFooter` hook, and global jQuery.
- Outbound mail enabled on the instance.

## 1. Install and build

```sh
git clone https://github.com/Vedesh-reddy/sfcc-custom-wishlist.git
cd sfcc-custom-wishlist
npm ci
npm run validate
```

The bundle is `cartridges/plugin_customwishlist/cartridge/static/default/js/customWishlist.js`. Build output is ignored by Git; deploy it with the cartridge.

## 2. Deploy the cartridge

Upload `cartridges/plugin_customwishlist` into the active code version with your usual tool (WebDAV, `sgmf-scripts`, the b2c CLI, or an IDE). Copy `dw.example.json` to `dw.json` for tools that read it; `dw.json` is ignored by Git.

The deployed controller must be at `<code-version>/plugin_customwishlist/cartridge/controllers/CustomWishlist.js`, and `steptypes.json` must be at `<code-version>/plugin_customwishlist/steptypes.json`.

## 3. Configure the cartridge path

In **Administration → Sites → Manage Sites → your site → Settings**, insert `plugin_customwishlist` before `app_storefront_base`:

```text
plugin_customwishlist:app_storefront_base:modules
```

Keep the site's other cartridges. Order relative to other plugins does not matter unless one also overrides `product/components/addToCartButtonExtension.isml`; in that case include `CustomWishlist-Button` from that template.

Do this before step 4. Custom job step types are registered from `steptypes.json` in cartridges on the site's path, and the job import refers to that step type.

## 4. Import the metadata

Open `metadata/custom-wishlist/jobs.xml` and set `<context site-id="…"/>` to your site ID (the sandbox used `RefArch_Practice`). Then:

```sh
npm run package:metadata
```

Import `dist/custom-wishlist-metadata.zip` in **Administration → Site Development → Site Import & Export**. It contains:

```text
custom-wishlist/
├── jobs.xml
└── meta/
    └── system-objecttype-extensions.xml
```

| Definition | Detail |
| --- | --- |
| `ProductListItem.wishlistAddedPrice` | Double. Price when added. |
| `ProductListItem.wishlistPriceCurrency` | String. Currency of that price. |
| `ProductListItem.wishlistLastNotifiedPrice` | Double. Last price reported in an alert. |
| `ProductListItem.wishlistPriceAlertPending` | Boolean, default `false`. Popup waiting. |
| Job `CustomWishlist-PriceDropCheck` | One step, `custom.CustomWishlist.PriceDropCheck`, daily at 02:00 UTC. |

Check **Administration → Site Development → System Object Types → ProductListItem → Attribute Definitions** and **Administration → Operations → Jobs**.

## 5. Configure email

Set the `customerServiceEmail` site preference. It is the sender address. Without it the job falls back to `no-reply@testorganization.com`.

## 6. Verify the full flow

1. As a guest, open a product page: **Sign in to save to wishlist** appears under Add to Cart.
2. Sign in, select a variant, and click **Add to wishlist**. The wishlist page shows the price when added.
3. Lower that variant's price in its price book.
4. Run `CustomWishlist-PriceDropCheck`. The log ends with `Wishlist price check finished: 1 emailed, 0 failed`.
5. Check the inbox, sign out, and sign in again. The popup lists the item; the wishlist page shows **Price dropped**.

Sandboxes disable scheduled execution of custom jobs, so use **Run Now** there.

## Add it to an existing RefArch workspace

Copy `cartridges/plugin_customwishlist`, `metadata/custom-wishlist`, and `test/unit/plugin_customwishlist` into the workspace. Add `sgmf-scripts --compile js --cartridgeName plugin_customwishlist` to `compile:js` and `sgmf-scripts --uploadCartridge plugin_customwishlist` to `uploadCartridge`. The [SFCC-RefArch](https://github.com/Vedesh-reddy/SFCC-RefArch) repository shows this setup.
