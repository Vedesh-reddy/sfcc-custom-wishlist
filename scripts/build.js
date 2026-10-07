'use strict';

const path = require('path');
const webpack = require('webpack');

const cartridge = path.resolve(__dirname, '../cartridges/plugin_customwishlist/cartridge');

// The storefront provides jQuery globally; this bundle contains only wishlist behavior.
const compiler = webpack({
    mode: 'production',
    entry: path.join(cartridge, 'client/default/js/customWishlist.js'),
    output: { path: path.join(cartridge, 'static/default/js'), filename: 'customWishlist.js' }
});

compiler.run(function (error, stats) {
    compiler.close(function (closeError) {
        if (error || closeError || stats.hasErrors()) {
            console.error(error || closeError || stats.toString({ all: false, errors: true }));
            process.exitCode = 1;
            return;
        }
        console.log('Built customWishlist.js in cartridge/static/default/js.');
    });
});
