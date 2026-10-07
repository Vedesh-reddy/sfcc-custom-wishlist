# Contributing

Start from `main` and create a focused `feature/`, `fix/`, or `docs/` branch. Keep behavior changes and documentation accurate together.

```sh
npm ci
npm run validate
npm run package:metadata
```

For a platform behavior change, also exercise the affected workflow on an SFCC sandbox: add a product, lower its price-book price, run `CustomWishlist-PriceDropCheck`, and sign in again. CI mocks cannot validate price books, mail delivery, remote includes, or metadata installation. Document which checks were automated and which were performed manually.

Use the PR template to explain the trigger, resulting behavior, validation, and deployment notes. Add tests for regressions involving price comparison, repeat suppression, currency handling, or mail failure. Preserve the rules that the popup flag is committed before mail is sent and that the job iterator is always closed.

Keep credentials and generated output out of Git. Add new attributes to both the metadata and the installation guide. Update the resource bundle for new text.

See [NOTICE.md](NOTICE.md) for attribution and terms.
