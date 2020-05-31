(function ($) {
  "use strict";

  let products = {};

  // This function called when user open cart.html
  const init = () => {
    loadProducts();

    $(".to-cart-btn").on('click', onClickToCartBtn);

    renderHeaderMiniCart();
  };

  // Function for loading selected products from sessionStorage
  const loadProducts = () => {
    if (sessionStorage.getItem("cart")) {
      products = JSON.parse(sessionStorage.getItem("cart"));
    }

    for (let key in products){
      let selector = `[data-id=${key.toString()}]`;
      $(selector).find(".to-cart-btn").html("Добавлено");
    }
  };

  const onClickToCartBtn = (event) => {
    let element = event.target;
    let productElement = $(element).closest(".product-item");
    productElement = $(productElement);

    let dataId = productElement.attr("data-id");
    let img = productElement.find(".image img").attr("src");
    let name = productElement.find(".title a").html();
    let price = productElement.find(".inner-price").html();

    let prod = { [dataId]: {name, img, price, amount: 1 } };

    addProductToCart(prod, dataId, productElement)
  };

  // Add or delete products in cart
  const addProductToCart = (prod, dataId, productsElement) => {

    if (!products[dataId]){
      products = {...prod, ...products};
      productsElement.find(".to-cart-btn").html("Добавлено");
    } else {
      delete products[dataId];
      productsElement.find(".to-cart-btn").html("В корзину");
    }

    sessionStorage.setItem("cart", JSON.stringify(products));
    renderHeaderMiniCart()
  };


  // Function for calculating total price of selected products
  const getTotalPriceOfProducts = () => {
    let totalPrice = 0;

    for (let key in products){
      totalPrice += (parseFloat(products[key].price) * parseFloat(products[key].amount))
    }

    return totalPrice;
  };

  const renderHeaderMiniCart = () => {
    let numberOfProducts = Object.keys(products).length;
    $(".header-mini-cart-amount").html(`${numberOfProducts} ($${getTotalPriceOfProducts()})`);
  };


  // CART PAGE
  // Function for rendering products to cart.html
  const renderProducts = () => {
    let out = "";
    for (let i = 0; i < products.length; i++) {
      out += "<tr>";
      out +=
        '<td class="pro-thumbnail"><a href="#"><img src="' +
        products[i].img +
        '" alt="" /></a></td>';
      out +=
        '<td class="pro-title"><a href="#">' + products[i].name + "</a></td>";
      out +=
        '<td class="pro-price"><span class="amount">$' +
        products[i].price +
        "</span></td>";
      out +=
        '<td class="pro-quantity"><div class="pro-qty"><input type="text" class="pro-qty-input" value="' +
        products[i].count +
        '"></div></td>';
      out += '<td class="pro-subtotal">$' + products[i].price + "</td>";
      out += '<td class="pro-remove"><a href="#">×</a></td>';
      out += "</tr>";
    }

    $(".cart-container").html(out);
    renderTotalPriceOfProducts();
  };

  // Function for showing total price of selected products
  const renderTotalPriceOfProducts = () => {
    $(".total-amount").html(getTotalPriceOfProducts() + "$");
  };

  init();
})(jQuery);
