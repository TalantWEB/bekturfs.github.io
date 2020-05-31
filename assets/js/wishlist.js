(function ($) {
    "use strict";

    let wishList = {};

    // This function called when user open
    const init = () => {
        loadWishList();

        $(".to-wishlist-btn").on('click', addProductToWishList);

        renderHeaderMiniWishList();
    };

    // Function for loading selected products from sessionStorage
    const loadWishList = () => {
        if (Cookies.get("wishlist")) {
            wishList = JSON.parse(Cookies.get("wishlist"));
        }

        for (let key in wishList){
            let selector = `[data-id=${key.toString()}]`;
            $(selector).find(".to-wishlist-btn").html("Добавлено");
        }
    };

    // Add or delete products in cart
    const addProductToWishList = (event) => {
        let element = event.target;
        let productElement = $(element).closest(".product-item");
        productElement = $(productElement);

        let dataId = productElement.attr("data-id");
        let img = productElement.find(".image img").attr("src");
        let name = productElement.find(".title a").html();
        let price = productElement.find(".inner-price").html();

        let prod = { [dataId]: {name, img, price, amount: 1 } };

        if (!wishList[dataId]){
            wishList = {...prod, ...wishList};
            productElement.find(".to-wishlist-btn").html("Добавлено");
        } else {
            delete wishList[dataId];
            productElement.find(".to-wishlist-btn").html("В избранное");
        }

        Cookies.set("wishlist", JSON.stringify(wishList));
        renderHeaderMiniWishList()
    };

    const renderHeaderMiniWishList = () => {
        let numberOfProducts = Object.keys(wishList).length;
        $(".wishlist-amount").html(numberOfProducts);
    };

    init();
})(jQuery);
