(function ($) {
  "use strict";

  let products = [];

  // This function called when user open cart.html
  const init = () => {
    loadProducts();
  };

  // Funсtion for loading selected products from sessionStorage
  const loadProducts = () => {
    if (sessionStorage.getItem("Cart")) {
      products = JSON.parse(sessionStorage.getItem("Cart"));
      renderProducts();
    }
  };

  // Function for calculating total price of selected products
  const getTotalPriceOfProducts = () => {
    let totalPrice = 0;

    for (let i = 0; i < products.length; i++) {
      totalPrice += parseFloat(products[i].price * products[i].count);
    }

    return totalPrice;
  };

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
