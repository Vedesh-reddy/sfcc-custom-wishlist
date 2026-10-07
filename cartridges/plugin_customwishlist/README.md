# plugin_customwishlist

SFRA overlay for a shopper wishlist with scheduled price-drop alerts by email and a post-login popup.

Use the [repository README](../../README.md) for screenshots and a quick start.
The [installation guide](../../docs/INSTALLATION.md) covers deployment, metadata import, and cartridge-path configuration.
The [code reference](../../docs/CODE-REFERENCE.md) documents every module and template.

The plugin must precede `app_storefront_base` in the site's cartridge path.
Build from the repository root using `npm run build`; no nested npm project or `dw.json` is needed here.

Business Manager locations:

- **Merchant Tools → Products and Catalogs → Products → product → Pricing**
- **Administration → Operations → Jobs → CustomWishlist-PriceDropCheck**
