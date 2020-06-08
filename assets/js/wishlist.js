(function ($) {
  "use strict";

  var wishList = {};

  var setWishlist = function(prod){
    wishList = Object.assign(wishList, prod);
    updateWishlistInCookie();

    var cart = getCartFromSessionStorage();
    if (ifProductExistInCart(Object.keys(prod)[0])){
      cart = Object.assign(cart, prod);
      saveCartToSessionStorage(cart)
    }

  };

  var updateWishlistInCookie = function(){
    Cookies.set("wishlist", JSON.stringify(wishList));
    reRenderHeaderMiniCart()
  };

  var reRenderHeaderMiniCart = function(){
    var numberOfProducts = 0;
    var products = getCartFromSessionStorage();
    var totalPrice = 0;

    for(var key in products){
      numberOfProducts += products[key]['amount'];
      totalPrice += products[key]['amount'] * products[key]['price']
    }
    $(".header-mini-cart-amount").html(numberOfProducts + ' ($' + totalPrice + ')');
  };

  // This function called when start
  var initWishlist = function(){
    loadWishList();

    $(".to-wishlist-btn").on("click", addProductToWishList);

    renderHeaderMiniWishList();
    renderWishList();
  };

  // Function for loading selected products from sessionStorage
  var loadWishList = function(){
    if (Cookies.get("wishlist")) {
      wishList = JSON.parse(Cookies.get("wishlist"));
    }

    for (var key in wishList) {
      var selector = '[data-id=' + key.toString() + ']';
      $(selector).find(".to-wishlist-btn").html("Добавлено");
    }
  };

  // Add or delete products in wishlist
  var addProductToWishList = function(event) {
    var element = event.target;
    var productElement = $(element).closest(".product-item");
    productElement = $(productElement);

    var dataId = productElement.attr("data-id");
    var img = productElement.find(".image img").attr("src");
    var name = productElement.find(".title a").html();
    var price = productElement.find(".inner-price").html();
    var size = productElement.find(".size .size-inner").first().html();
    var color = productElement.find(".color .color-inner").first().css("background-color");

    var prod = { [dataId]: { name, img, price, amount: 1, size, color } };

    var toWishlistBtn = productElement.find(".to-wishlist-btn");

    if (!wishList[dataId]) {
      wishList = Object.assign(wishList, prod);
      //если кнопка имеет класс single-wishlist-btn, просто меняем фон
      toWishlistBtn.hasClass('single-wishlist-btn')? btn.css({"background-color":'#63D1B5'}) : btn.html("Добавлено");
    } else {
      delete wishList[dataId];
      //если кнопка имеет класс single-wishlist-btn, просто меняем фон
      toWishlistBtn.hasClass('single-wishlist-btn')? btn.css({"background-color":'#b663d1'}) : btn.html("В избранное") ;
    }

    Cookies.set("wishlist", JSON.stringify(wishList));
    renderHeaderMiniWishList();
  };

  var renderHeaderMiniWishList = function(){
    var numberOfProducts = Object.keys(wishList).length;
    $(".wishlist-amount").html(numberOfProducts);
  };

  // WISHLIST PAGE
  // Function for rendering products to wishList.html

  var ifProductExistInCart = function (id) {
    var cart = getCartFromSessionStorage();
    return  cart.hasOwnProperty(id)
  };

  var getCartFromSessionStorage = function () {
    var cart = JSON.parse(sessionStorage.getItem('cart'));
    return cart ? cart : {}
  };

  var saveCartToSessionStorage = function(cart) {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    reRenderHeaderMiniCart();
  };

  var renderWishList = function(){
    var out = "";

    for (var key in wishList) {

      var productStatus = ifProductExistInCart(key) ? 'Добавлено' : 'В корзину';

      out += '<tr class="wishlist-product" data-id="' + key + '">';
      out +=
        '<td class="pro-thumbnail image"><a href="#"><img src="' +
        wishList[key].img +
        '" alt="" /></a></td>';
      out +=
        '<td class="pro-title title"><a href="#">' +
        wishList[key].name +
        "</a></td>";
      out += '<td class="pro-price"><span class="amount">$<span class="inner-price">' + wishList[key].price + '</span>';
      out +=
        '<td class="pro-quantity"><div class="pro-qty"><input type="text" class="pro-qty-input" value="' +
        wishList[key].amount +
        '"></div></td>';
      out += '<td class="pro-add-cart"><a class="to-cart-from-wishlist-btn">' + productStatus + '</a></td>';
      out += '<td class="pro-remove"><a>×</a></td>';
      out += "</tr>";
    }

    $(".wishlist-container").html(out);

    onQuantityChangeListeners();
    onDeleteListener();
    onAddToCartListener();
  };

  var onQuantityChangeListeners = function(){
    /*-----
      Quantity
  --------------------------------*/
    $('.pro-qty').prepend('<span class="dec qtybtn"><i class="ti-minus"></i></span>');
    $('.pro-qty').append('<span class="inc qtybtn"><i class="ti-plus"></i></span>');

    // Сработает когда пользователь изменяет количество
    $('.qtybtn').on('click', function()  {

      var $button = $(this);
      var dataId = $button.closest('.wishlist-product').attr('data-id');

      var oldValue = $button.parent().find('input').val();
      var newVal = 1;
      if ($button.hasClass('inc')) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? (parseFloat(oldValue) - 1) : 1
      }

      var prod = { [dataId]: { name: wishList[dataId].name, img: wishList[dataId].img ,price: wishList[dataId].price , amount: newVal }};

      $button.parent().find('input').val(newVal);
      setWishlist(prod);
    });

    //
    $('.pro-qty input').on('input', function () {

      var $input = $(this);
      var dataId = $input.closest('.cart-product').attr('data-id');

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)){
        newVal = 0;
      }

      var prod = { [dataId]: { name: wishList[dataId].name, img: wishList[dataId].img ,price: wishList[dataId].price , amount: newVal }};

      setWishlist(prod);
    })
  };

  var onAddToCartListener = function () {
    $('.to-cart-from-wishlist-btn').on('click', function (event) {
      var $button = $(event.target);
      var productId = $button.closest('.wishlist-product').attr('data-id');

      var cart = getCartFromSessionStorage();
      var product = {[productId]: wishList[productId]};

      var selector = '[data-id=' + productId.toString() + ']';

      if (cart.hasOwnProperty(productId)){
        delete cart[productId];
        $(selector).find(".to-cart-from-wishlist-btn").html("В корзину");
      } else {
        cart = Object.assign(cart, product);
        $(selector).find(".to-cart-from-wishlist-btn").html("Добавлено");
      }

      saveCartToSessionStorage(cart);
    })
  };

  var onDeleteListener = function(){
    $('.pro-remove a').on('click', function (e) {
      e.preventDefault();

      var dataId = $(this).closest('.wishlist-product').attr('data-id');
      if (dataId){
        delete wishList[dataId];
        updateWishlistInCookie();
        renderWishList();
      }
    })
  };

  initWishlist();
})(jQuery);
