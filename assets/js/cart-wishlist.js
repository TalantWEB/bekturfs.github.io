(function ($) {
  "use strict";

  var KGZ = 77;
  var USD = 1;
  var currency = "KGZ";

  var initCurrency = function(){

    renderCurrency();

    $(".curr-kgz a").on("click", function(){
      currency = "KGZ";
      reRenderWhenCurrencyChange();
    });

    $(".curr-usd a").on("click", function(){
      currency = "USD";
      reRenderWhenCurrencyChange();
    })

  };

  var reRenderWhenCurrencyChange = function () {
    renderCurrency();
    renderHeaderMiniWishList();
    renderHeaderMiniCart();
    renderProductsInCart();
    renderProductsInWishlist();
    renderTotalPriceOfProducts();
    reRenderTotalPriceOfOneProduct();
  };

  var renderCurrency = function(){
    if (currency === "KGZ"){
      $(".curr-kgz a").css("color", "#63d1b5")
      $(".curr-usd a").css("color", "#ffffff")
    } else {
      $(".curr-usd a").css("color", "#63d1b5")
      $(".curr-kgz a").css("color", "#ffffff")
    }
  }

  // Cart and setCart
  var cart = {};

  var setCart = function (prod) {
    cart = prod ? Object.assign(cart, prod) : cart;
    sessionStorage.setItem("cart", JSON.stringify(cart));
    renderHeaderMiniCart();
  };

  // This function called when user open any page
  var initCart = function () {
    // Загружаем существующие товары из sessionStorage
    loadCart();
    //
    onClickToCartBtnListener();
    // вызываем функцию для вывода числа выбранных товаров и общую сумму в шапке
    renderHeaderMiniCart();
    // Если есть элемент с таким классом, выводим выбранные товары
    renderProductsInCart();
    // Срабатывает при нажатии на кнопку "Обновить" на странице корзины
    updateCartBtnListener();
  };

  // Function for loading selected products from sessionStorage
  var loadCart = function () {
    if (sessionStorage.getItem("cart")) {
      cart = JSON.parse(sessionStorage.getItem("cart"));
    }

    for (var key in cart) {
      var selector = "[data-id=" + key.toString() + "]";
      $(selector).find(".to-cart-btn").html("Добавлено");
    }
  };

  var onClickToCartBtnListener = function () {
    if ($(".to-cart-btn")[0]) {
      $(".to-cart-btn").on("click", function (event) {
        var element = event.target;
        var productElement = $(element).closest(".product-item");
        productElement = $(productElement);

        var dataId = productElement.attr("data-id");
        var img = productElement.find(".image img").attr("src");
        var name = productElement.find(".title a").html();
        var price = productElement.find(".inner-price").html();
        var size = productElement.find(".size .size-inner").first().html();
        var color = productElement
          .find(".color .color-inner")
          .first()
          .css("background-color");

        var prod = { [dataId]: { name, img, price, amount: 1, size, color } };

        addProductToCart(prod, dataId) ? productElement.find(".to-cart-btn").html("Добавлено") : productElement.find(".to-cart-btn").html("В корзину");
        setCart();
      });
    }
  };

  // Функция для добавление и удаление продукта в корзине
  var addProductToCart = function (prod, dataId) {
    // Проверяем не существует ли товар в списке товаров
    if (!cart[dataId]) {
      cart = Object.assign(cart, prod);
      return true;
    } else {
      delete cart[dataId];
      return false;
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    // После того как добавили/удалили товар обновляем количество в шапке
    renderHeaderMiniCart();
  };

  var renderHeaderMiniCart = function () {
    var numberOfProducts = getNumberOfProducts(cart);
    var totalPriceOfProducts = getTotalPriceOfProducts(cart);
    $(".header-mini-cart-amount").html(
      numberOfProducts + " (" + totalPriceOfProducts + ")"
    );
  };

  // CART PAGE
  // Function for rendering products to cart.html
  var renderProductsInCart = function () {
    if (!$(".cart-container")[0]) {
      return;
    }

    var out = "";
    var productPrice = 0;
    var products = cart;

    for (var key in products) {
      productPrice =
        currency == "KGZ"
          ? (products[key].price * KGZ).toString() + " сом"
          : (products[key].price * USD).toString() + " $";

      out += '<tr class="cart-product" data-id="' + key + '">';
      out +=
        '<td class="pro-thumbnail"><a href="#"><img src="' +
        products[key].img +
        '" alt="" /></a></td>';
      out +=
        '<td class="pro-title"><a href="#">' + products[key].name + "</a></td>";
      out +=
        '<td class="pro-price"><span class="amount">' +
        productPrice +
        "</span></td>";
      out +=
        '<td class="pro-quantity"><div class="pro-qty cart-pro-qty"><input type="text" value="' +
        products[key].amount +
        '"></div></td>';
      out +=
        '<td class="pro-subtotal"><span class="product-subtotal">' +
        getTotalPriceOfOneProduct(cart, key) +
        "</span></td>";
      out += '<td class="pro-remove"><a href="#">×</a></td>';
      out += "</tr>";
    }

    $(".cart-container").html(out);

    renderTotalPriceOfProducts();
    onQuantityChangeListenersInCart();
    onDeleteInCartListener();
  };

  // Function for showing total price of selected products
  var renderTotalPriceOfProducts = function () {
    var totalPriceOfProducts = getTotalPriceOfProducts(cart);
    $(".total-amount").html(totalPriceOfProducts.toString());
  };

  var reRenderTotalPriceOfOneProduct = function (id) {
    var totalPriceOfOneProduct = getTotalPriceOfOneProduct(cart, id);
    $('[data-id=' + id + ']')
      .find(".product-subtotal")
      .html(totalPriceOfOneProduct.toString());
  };

  // LISTENERS

  var onDeleteInCartListener = function () {
    $(".pro-remove a").on("click", function (event) {
      event.preventDefault();

      var dataId = $(this).closest(".cart-product").attr("data-id");
      if (dataId) {
        delete cart[dataId];
        setCart();
        renderProductsInCart();
      }
    });
  };

  var onQuantityChangeListenersInCart = function () {
    /*-----
          Quantity
      --------------------------------*/
    $(".cart-pro-qty").prepend(
      '<span class="dec qtybtn cart-qty-btn"><i class="ti-minus"></i></span>'
    );
    $(".cart-pro-qty").append(
      '<span class="inc qtybtn cart-qty-btn"><i class="ti-plus"></i></span>'
    );

    // Сработает когда пользователь изменяет количество
    $(".cart-qty-btn").on("click", function () {
      var $button = $(this);
      var dataId = $button.closest(".cart-product").attr("data-id");

      var oldValue = $button.parent().find("input").val();
      var newVal = 1;
      if ($button.hasClass("inc")) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? parseFloat(oldValue) - 1 : 1;
      }

      var prod = {
        [dataId]: {
          name: cart[dataId].name,
          img: cart[dataId].img,
          price: cart[dataId].price,
          amount: newVal,
        },
      };

      $button.parent().find("input").val(newVal);
      setCart(prod);
      renderTotalPriceOfProducts(cart);
      reRenderTotalPriceOfOneProduct(dataId);
    });

    // Срабаботает при изменение количества input-ом
    $(".cart-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".cart-product").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }

      var prod = {
        [dataId]: {
          name: cart[dataId].name,
          img: cart[dataId].img,
          price: cart[dataId].price,
          amount: newVal,
        },
      };

      setCart(prod);
    });
  };

  var updateCartBtnListener = function () {
    if (!$(".cart-buttons input")) {
      return;
    }

    $(".cart-buttons input").on("click", function (event) {
      event.preventDefault();

      for (var key in cart) {
        cart[key]["amount"] = 1;
      }

      setCart();
      renderProductsInCart();
    });
  };

  // WISHLIST

  var wishList = {};

  var setWishlist = function (prod) {
    wishList = prod ? Object.assign(wishList, prod) : wishList;
    $.cookie("wishlist", JSON.stringify(wishList), { path: "/" });

    if (prod && ifProductExistInCart(Object.keys(prod)[0])) {
      cart = Object.assign(cart, prod);
      setCart();
    }

    renderHeaderMiniCart();
    renderHeaderMiniWishList();
  };

  // 
  var initWishlist = function () {
    loadWishList();
    onClickToWishlistListener();
    renderHeaderMiniWishList();
    renderProductsInWishlist();
  };

  // Function for loading selected products from sessionStorage
  var loadWishList = function () {
    if (
      $.cookie("wishlist") &&
      document.cookie.lastIndexOf("wishlist") !== -1
    ) {
      wishList = JSON.parse($.cookie("wishlist"));
    }

    for (var key in wishList) {
      var selector = "[data-id=" + key.toString() + "]";
      $(selector).find(".to-wishlist-btn").html("Добавлено");
    }
  };
  

  // Add or delete products in wishlist
  var onClickToWishlistListener = function () {
    $(".to-wishlist-btn").on("click", function (event) {
      var element = event.target;
      var productElement = $(element).closest(".product-item");
      productElement = $(productElement);

      var dataId = productElement.attr("data-id");
      var img = productElement.find(".image img").attr("src");
      var name = productElement.find(".title a").html();
      var price = productElement.find(".inner-price").html();
      var size = productElement.find(".size .size-inner").first().html();
      var color = productElement
        .find(".color .color-inner")
        .first()
        .css("background-color");

      var prod = { [dataId]: { name, img, price, amount: 1, size, color } };

      var toWishlistBtn = productElement.find(".to-wishlist-btn");

      if (!wishList[dataId]) {
        wishList = Object.assign(wishList, prod);
        //если кнопка имеет класс single-wishlist-btn, просто меняем фон
        toWishlistBtn.hasClass("single-wishlist-btn")
          ? btn.css({ "background-color": "#63D1B5" })
          : toWishlistBtn.html("Добавлено");
      } else {
        delete wishList[dataId];
        //если кнопка имеет класс single-wishlist-btn, просто меняем фон
        toWishlistBtn.hasClass("single-wishlist-btn")
          ? btn.css({ "background-color": "#b663d1" })
          : toWishlistBtn.html("В избранное");
      }

      $.cookie("wishlist", JSON.stringify(wishList), { path: "/" });
      renderHeaderMiniWishList();
    });
  };

  var renderHeaderMiniWishList = function () {
    var numberOfProducts = Object.keys(wishList).length
      ? Object.keys(wishList).length
      : 0;
    $(".wishlist-amount").html(numberOfProducts);
  };

  // WISHLIST PAGE

  // Function for rendering products to wishList.html
  var renderProductsInWishlist = function () {

    if (!$("wishlist-container")){
      return;
    }

    var out = "";
    var productPrice;
    var productStatus;
    for (var key in wishList) {
      productPrice =
        currency === "KGZ"
          ? (wishList[key].price * KGZ).toString() + " сом"
          : (wishList[key].price * USD).toString() + " $";

      productStatus = ifProductExistInCart(key) ? "Добавлено" : "В корзину";

      out += '<tr class="wishlist-product" data-id="' + key + '">';
      out +=
        '<td class="pro-thumbnail image"><a href="#"><img src="' +
        wishList[key].img +
        '" alt="" /></a></td>';
      out +=
        '<td class="pro-title title"><a href="#">' +
        wishList[key].name +
        "</a></td>";
      out +=
        '<td class="pro-price"><span class="amount"><span class="inner-price">' +
        productPrice +
        "</span>";
      out +=
        '<td class="pro-quantity"><div class="pro-qty wishlist-pro-qty"><input type="text" value="' +
        wishList[key].amount +
        '"></div></td>';
      out +=
        '<td class="pro-add-cart"><a class="to-cart-from-wishlist-btn">' +
        productStatus +
        "</a></td>";
      out += '<td class="pro-remove"><a>×</a></td>';
      out += "</tr>";
    }

    $(".wishlist-container").html(out);

    onQuantityChangeInWishlistListeners();
    onDeleteInWishlistListener();
    onAddToCartFromWishlistListener();
  };

  var onQuantityChangeInWishlistListeners = function () {
    /*-----
          Quantity
      --------------------------------*/
    $(".wishlist-pro-qty").prepend(
      '<span class="dec qtybtn wishlist-qtybtn"><i class="ti-minus"></i></span>'
    );
    $(".wishlist-pro-qty").append(
      '<span class="inc qtybtn wishlist-qtybtn"><i class="ti-plus"></i></span>'
    );

    // Сработает когда пользователь изменяет количество
    $(".wishlist-qtybtn").on("click", function () {
      var $button = $(this);
      var dataId = $button.closest(".wishlist-product").attr("data-id");

      var oldValue = $button.parent().find("input").val();
      var newVal = 1;
      if ($button.hasClass("inc")) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? parseFloat(oldValue) - 1 : 1;
      }

      var prod = {
        [dataId]: {
          name: wishList[dataId].name,
          img: wishList[dataId].img,
          price: wishList[dataId].price,
          amount: newVal,
        },
      };

      $button.parent().find("input").val(newVal);
      setWishlist(prod);
    });

    //
    $(".wishlist-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".wishlist-product").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }

      var prod = {
        [dataId]: {
          name: wishList[dataId].name,
          img: wishList[dataId].img,
          price: wishList[dataId].price,
          amount: newVal,
        },
      };

      setWishlist(prod);
    });
  };

  var onAddToCartFromWishlistListener = function () {
    $(".to-cart-from-wishlist-btn").on("click", function (event) {
      var $button = $(event.target);
      var productId = $button.closest(".wishlist-product").attr("data-id");

      var product = { [productId]: wishList[productId] };

      var selector = "[data-id=" + productId.toString() + "]";

      if (cart.hasOwnProperty(productId)) {
        delete cart[productId];
        $(selector).find(".to-cart-from-wishlist-btn").html("В корзину");
      } else {
        cart = Object.assign(cart, product);
        $(selector).find(".to-cart-from-wishlist-btn").html("Добавлено");
      }

      setCart()
    });
  };

  var onDeleteInWishlistListener = function () {
    $(".pro-remove a").on("click", function (e) {
      e.preventDefault();

      var dataId = $(this).closest(".wishlist-product").attr("data-id");
      if (dataId) {
        delete wishList[dataId];
        setWishlist()
        renderProductsInWishlist();
      }
    });
  };

  var ifProductExistInCart = function (id) {
    return cart.hasOwnProperty(id);
  };

  // These functions work for cart and wihslist (Both of them)

  // Function for calculating total price of selected products
  var getTotalPriceOfProducts = function (products) {
    var totalPrice = 0;

    for (var key in products) {
      totalPrice +=
        parseFloat(products[key].price) * parseFloat(products[key].amount);
    }

    if (currency == "KGZ") {
      totalPrice *= KGZ;
      return totalPrice.toString() + " сом";
    } else {
      totalPrice *= USD;
      return totalPrice.toString() + " $";
    }
  };

  var getNumberOfProducts = function (products) {
    var numberOfProducts = 0;
    for (var key in products) {
      numberOfProducts += products[key]["amount"];
    }
    return numberOfProducts;
  };

  var getTotalPriceOfOneProduct = function (products, id) {
    var totalPrice = products[id]
      ? parseFloat(products[id].amount) * parseFloat(products[id].price)
      : 0;

    if (currency == "KGZ") {
      totalPrice *= KGZ;
      return totalPrice.toString() + " сом";
    } else {
      totalPrice *= USD;
      return totalPrice.toString() + " $";
    }
  };

  initCart();
  initWishlist();
  initCurrency();

})(jQuery);
