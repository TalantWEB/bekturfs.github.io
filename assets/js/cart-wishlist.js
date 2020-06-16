(function ($) {
  "use strict";

  // CURRENCY
  var KGZ = 77;
  var USD = 1;
  var usdIcon = ' $';
  var kgzIcon = ' <span style="text-decoration: underline">c</span>';

  var currency = "";

  var initCurrency = function () {
    loadCurrency();

    renderCurrency();

    $(".curr-kgz a").on("click", function () {
      setCurrency("KGZ");
      reRenderWhenCurrencyChange();
    });

    $(".curr-usd a").on("click", function () {
      setCurrency("USD");
      reRenderWhenCurrencyChange();
    });
  };

  var loadCurrency = function () {
    if (sessionStorage.getItem("currency")) {
      currency = sessionStorage.getItem("currency");
    } else {
      currency = "USD";
      sessionStorage.setItem("currency", "USD");
    }
    reRenderWhenCurrencyChange();
  };

  var setCurrency = function (curr) {
    currency = curr;
    sessionStorage.setItem("currency", curr);
  };

  var reRenderWhenCurrencyChange = function () {
    renderCurrency();
    reRenderProductsPrice();
    renderHeaderMiniCart();
    renderProductsInCart();
    renderProductsInWishlist();
    renderTotalPriceOfProducts();
  };

  var renderCurrency = function () {
    if (currency === "KGZ") {
      $(".curr-kgz a").css("color", "#63d1b5");
      $(".curr-usd a").css("color", "#ffffff");
    } else {
      $(".curr-usd a").css("color", "#63d1b5");
      $(".curr-kgz a").css("color", "#ffffff");
    }
  };

  var reRenderProductsPrice = function () {

    if ($(".content-right .price")[0]){
      $(".content-right .price").each(function(index, obj){

        var $innerPrice = $(obj).find(".inner-price");
        var $innerPriceIcon = $(obj).find(".inner-price-icon");
        var dataPrice = $(obj).closest(".price").attr("data-price");

        var price = dataPrice ? parseFloat(dataPrice) : 0;

        if (currency === "KGZ" && price ){
          $innerPrice.html(price * KGZ);
          $innerPriceIcon.html(kgzIcon);
        } else if (currency === "USD" && price){
          $innerPrice.html(price * USD);
          $innerPriceIcon.html(usdIcon);
        }
      });
    }

    if ($(".head-right .price")[0]) {
      $(".head-right .price").each(function(index, obj){

        var $innerPrice = $(obj).find(".inner-price");
        var $innerPriceIcon = $(obj).find(".inner-price-icon");
        var dataPrice = $(obj).closest(".price").attr("data-price");

        var price = dataPrice ? parseFloat(dataPrice) : 0;

        if (currency === "KGZ" && price ){
          $innerPrice.html(price * KGZ);
          $innerPriceIcon.html(kgzIcon);
        } else if (currency === "USD" && price){
          $innerPrice.html(price * USD);
          $innerPriceIcon.html(usdIcon);
        }
      });
    }
  };

  
  // CART
  var productColors = [];
  var productSizes = [];
  var productAmount = 1;

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
      $(selector).hasClass("single-product-item") ?
          $(selector).find(".to-cart-btn-text").html("Добавлено") :
          $(selector).find(".to-cart-btn").html("Добавлено")
    }
  };

  // Для кнопки "В корзину" в shop.html и single-product.html
  var onClickToCartBtnListener = function () {
    if ($(".to-cart-btn")[0]) {
      $(".to-cart-btn").on("click", function (event) {
        var element = event.target;
        var productElement = $(element).closest(".product-item");
        productElement = $(productElement);

        var dataId = productElement.attr("data-id");
        var img = productElement.find(".image img").attr("src") || productElement.find(".pro-large-img img").attr("src");
        var name = productElement.find(".title a").html() || productElement.find(".title").html();
        var price = productElement.find(".price").attr("data-price");

        var prod = _defineProperty({}, dataId, {
          name: name,
          img: img,
          price: price,
          amount: productAmount,
          size: productSizes,
          colors: productColors
        });

        if (addProductToCart(prod, dataId)){
          productElement.hasClass("single-product-item") ?
              productElement.find(".to-cart-btn-text").html("Добавлено") :
              productElement.find(".to-cart-btn").html("Добавлено")
        } else {
          productElement.hasClass("single-product-item") ?
              productElement.find(".to-cart-btn-text").html("В избранное") :
              productElement.find(".to-cart-btn").html("В избранное")
        }

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
          ? (products[key].price * KGZ).toString() + kgzIcon : (products[key].price * USD).toString() + usdIcon;

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
    var $totalAmount = $(".total-amount");

    if (!$totalAmount) {
      return;
    }

    var totalPriceOfProducts = getTotalPriceOfProducts(cart);
    $totalAmount.html(totalPriceOfProducts.toString());
  };

  var reRenderTotalPriceOfOneProduct = function (id) {
    var $pro = $("[data-id=" + id + "]");

    if (!$pro) {
      return;
    }

    var totalPriceOfOneProduct = getTotalPriceOfOneProduct(cart, id);
    $pro.find(".product-subtotal").html(totalPriceOfOneProduct.toString());
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

      var prod = _defineProperty({}, dataId, {
        name: cart[dataId].name,
        img: cart[dataId].img,
        price: cart[dataId].price,
        amount: newVal,
        colors: cart[dataId].colors,
        size: cart[dataId].size
      });

      $button.parent().find("input").val(newVal);
      setCart(prod);
      renderTotalPriceOfProducts(cart);
      reRenderTotalPriceOfOneProduct(dataId);
    });

    //  При изменение количества input-ом
    $(".cart-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".cart-product").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }

      var prod = _defineProperty({}, dataId, {
        name: cart[dataId].name,
        img: cart[dataId].img,
        price: cart[dataId].price,
        amount: newVal,
        colors: cart[dataId].colors,
        size: cart[dataId].size
      });

      setCart(prod);
    });
  };

  var updateCartBtnListener = function () {
    var cartButtonsInput = $(".cart-buttons input");

    if (!cartButtonsInput) {
      return;
    }

    cartButtonsInput.on("click", function (event) {
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

      $(selector).hasClass("single-product-item") ?
          $(selector).find(".to-wishlist-btn").css({"background-color" : "#63D1B5"}) :
          $(selector).find(".to-wihslist-btn").html("Добавлено")
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

      var prod = _defineProperty({}, dataId, {
        name: name,
        img: img,
        price: price,
        amount: productAmount,
        size: productSizes,
        colors: productColors
      });


      if (!wishList[dataId]) {
        wishList = Object.assign(wishList, prod);
        productElement.hasClass("single-product-item") ?
            productElement.find(".to-wishlist-btn").css({"background" : "#63D1B5"}) :
            productElement.find(".to-wishlist-btn").html("Добавлено")
      } else {
        delete wishList[dataId];
        productElement.hasClass("single-product-item") ?
            productElement.find(".to-wishlist-btn").css({"background" : "#b663d1"}) :
            productElement.find(".to-wishlist-btn").html("В избранное")
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
    if (!$("wishlist-container")) {
      return;
    }

    var out = "";
    var productPrice;
    var productStatus;
    for (var key in wishList) {
      productPrice =
        currency === "KGZ"
          ? (wishList[key].price * KGZ).toString() + kgzIcon
          : (wishList[key].price * USD).toString() + usdIcon;

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

      var prod = _defineProperty({}, dataId, {
        name: wishList[dataId].name,
        img: wishList[dataId].img,
        price: wishList[dataId].price,
        amount: newVal
      });

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

      var prod = _defineProperty({}, dataId, {
        name: wishList[dataId].name,
        img: wishList[dataId].img,
        price: wishList[dataId].price,
        amount: newVal
      });

      setWishlist(prod);
    });
  };

  var onAddToCartFromWishlistListener = function () {
    $(".to-cart-from-wishlist-btn").on("click", function (event) {
      var $button = $(event.target);
      var productId = $button.closest(".wishlist-product").attr("data-id");

      var product = _defineProperty({}, productId, wishList[productId]);

      var selector = "[data-id=" + productId.toString() + "]";

      if (cart.hasOwnProperty(productId)) {
        delete cart[productId];
        $(selector).find(".to-cart-from-wishlist-btn").html("В корзину");
      } else {
        cart = Object.assign(cart, product);
        $(selector).find(".to-cart-from-wishlist-btn").html("Добавлено");
      }

      setCart();
    });
  };

  var onDeleteInWishlistListener = function () {
    $(".pro-remove a").on("click", function (e) {
      e.preventDefault();

      var dataId = $(this).closest(".wishlist-product").attr("data-id");
      if (dataId) {
        delete wishList[dataId];
        setWishlist();
        renderProductsInWishlist();
      }
    });
  };

  var ifProductExistInCart = function (id) {
    return cart.hasOwnProperty(id);
  };

  var ifProductExistInWishlist = function (id) {
    return wishList.hasOwnProperty(id);
  };

  // These functions work for cart and wihslist (Both of them)

  // Function for calculating total price of selected products
  var getTotalPriceOfProducts = function (products) {
    var totalPrice = 0;

    for (var key in products) {
      totalPrice +=
        parseFloat(products[key].price) * parseFloat(products[key].amount);
    }

    if (currency === "KGZ") {
      totalPrice *= KGZ;
      return totalPrice.toString() + kgzIcon;
    } else {
      totalPrice *= USD;
      return totalPrice.toString() + usdIcon;
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

    if (currency === "KGZ") {
      totalPrice *= KGZ;
      return totalPrice.toString() + kgzIcon;
    } else {
      totalPrice *= USD;
      return totalPrice.toString() + usdIcon;
    }
  };

  // SINGLE-PRODUCT


  var initSingleProduct = function () {
    borderIfColorsSelected();
    onColorChangeListeners();
    onQuantityChangeInSingleProductListeners();
  };

  var borderIfColorsSelected = function () {
    var singleProductId = $(".single-product-item").attr("data-id");

    if (cart.hasOwnProperty(singleProductId)){
      productColors = cart[singleProductId].colors;

      if (productColors.includes("orange")){
        $(".product-color-orange").css({"border" : "4px solid blue"});
      }

      if (productColors.includes("yellow")){
        $(".product-color-yellow").css({"border" : "4px solid blue"});
      }

      if (productColors.includes("black")){
        $(".product-color-black").css({"border" : "4px solid blue"});
      }
    }
  };

  var onColorChangeListeners = function () {
    $(".product-color-orange").on("click", function () {
      changeProductColors(getProductId(this), "orange", this)
    });

    $(".product-color-yellow").on("click", function () {
      changeProductColors(getProductId(this), "yellow", this)
    });

    $(".product-color-black").on("click", function () {
      changeProductColors(getProductId(this), "black", this)
    });
  };

  var onQuantityChangeInSingleProductListeners = function () {
    /*-----
          Quantity
      --------------------------------*/
    var id = $(".single-product-item").attr("data-id");
    if (ifProductExistInCart(id)){
      $(".sp-pro-qty input").val(cart[id].amount)
    } else if (ifProductExistInWishlist(id)) {
      $(".sp-pro-qty input").val(wishList[id].amount)
    }


    $(".sp-pro-qty").prepend(
        '<span class="dec qtybtn sp-qtybtn"><i class="ti-minus"></i></span>'
    );
    $(".sp-pro-qty").append(
        '<span class="inc qtybtn sp-qtybtn"><i class="ti-plus"></i></span>'
    );

    // Сработает когда пользователь изменяет количество
    $(".sp-qtybtn").on("click", function () {
      var $button = $(this);
      var dataId = $button.closest(".single-product-item").attr("data-id");

      var oldValue = $button.parent().find("input").val();
      var newVal = 1;
      if ($button.hasClass("inc")) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? parseFloat(oldValue) - 1 : 1;
      }

      if (ifProductExistInCart(dataId)){
        var prod = _defineProperty({}, dataId, {
          name: cart[dataId].name,
          img: cart[dataId].img,
          price: cart[dataId].price,
          amount: newVal,
          colors: cart[dataId].colors,
          size: cart[dataId].size
        });
        setCart(prod);
      }

      if (ifProductExistInWishlist(dataId)){
        var prod = _defineProperty({}, dataId, {
          name: wishList[dataId].name,
          img: wishList[dataId].img,
          price: wishList[dataId].price,
          amount: newVal,
          colors: wishList[dataId].colors,
          size: wishList[dataId].size
        });
        setWishlist(prod);
      }


      productAmount = newVal;
      $button.parent().find("input").val(newVal);
    });

    //
    $(".sp-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".single-product-item").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }

      if (ifProductExistInCart(dataId)){
        var prod = _defineProperty({}, dataId, {
          name: cart[dataId].name,
          img: cart[dataId].img,
          price: cart[dataId].price,
          amount: newVal,
          colors: cart[dataId].colors,
          size: cart[dataId].size
        });
        setCart(prod);
      }

      if (ifProductExistInWishlist(dataId)){
        var prod = _defineProperty({}, dataId, {
          name: wishList[dataId].name,
          img: wishList[dataId].img,
          price: wishList[dataId].price,
          amount: newVal,
          colors: wishList[dataId].colors,
          size: wishList[dataId].size
        });
        setWishlist(prod);
      }

      productAmount = newVal;
    });
  };

  var changeProductColors = function (dataId, color, button) {
    if (productColors.includes(color)){
      productColors = productColors.filter(function (value) { return value !== color });
      $(button).css({"border" : "0px"});
      saveChangesIfProductExistInCart(dataId)
    } else {
      productColors.push(color);
      $(button).css({"border" : "4px solid blue"});
      saveChangesIfProductExistInCart(dataId)
    }
  };

  var saveChangesIfProductExistInCart = function (dataId) {
    if (ifProductExistInCart(dataId)){
      cart[dataId].colors = productColors;
      setCart()
    }
  };

  var getProductId = function (button) {
    return $(button).closest(".product-item").attr("data-id") ? $(button).closest(".product-item").attr("data-id") : null;
  };

  // Function for creating dynamic object keys
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  initCart();
  initWishlist();
  initCurrency();
  initSingleProduct();
})(jQuery);
