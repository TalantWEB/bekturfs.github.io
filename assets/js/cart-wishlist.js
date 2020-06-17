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
    renderProductPriceInSingle();
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
  var renderProductPrice = function(obj){
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
  }
  var reRenderProductsPrice = function () {
    $(".content-right .price").each(function(index, obj){
      renderProductPrice(obj);
    });
  };
  var renderProductPriceInSingle=function(){
    renderProductPrice('.single-product-item .price');
  };
  
  // CART
  var productSize='sm, m, l ,xl';
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
      var dataId = cart[key].productId;

      //cardItem - это карточки товаров, например в shop.html и в главной
      var cardItem =$('.product-item.card-product[data-id='+dataId+']');
      //если в корзине есть данный товар, то в карточке делаем активным тот цвет, который есть в корзине
      if(cardItem.find('span[color="'+cart[key].color+'"]')){
        cardItem.find('.color-inner').removeClass('chosen-color');
        cardItem.find('span[color="'+cart[key].color+'"]').addClass('chosen-color');
      }
      
      var selector = "[data-id=" + dataId + "]";
      var productElement = $(selector);
      //находим выбранный цвет товара
      var color=findChosenColor(productElement);
      //текст кнопки "в корзину"
      var newBtnText = 'В КОРЗИНУ';
      //меняем текст кнопки если товар есть в корзине
      ifProductExistInCart(productElement.attr('data-id')+color)? newBtnText='ДОБАВЛЕНО' : newBtnText='В КОРЗИНУ';

      productElement.hasClass("single-product-item") ?
      productElement.find(".to-cart-btn-text").html(newBtnText) :
      productElement.find(".to-cart-btn").html(newBtnText);

    }
  };

  //Находит выбранный цвет в указанном родительском элементе
  var findChosenColor = function (productElement) {
    var size = findProductSize(productElement);
    var color = "";
    //если у товара более одного размера находим выбранный цвет
    if(size.length >= 2){
      //если нет выбранного цвета берем первый цвет из спискс цветов товара
      if (!productElement.find(".chosen-color").length) {
        color = productElement.find(".color .color-inner:first-child").attr("color") || productElement.find(".color-options .color-inner:first-child").attr("color");
      }
      //находим выбранный цвет
      else{
        color = productElement.find(".chosen-color").attr("color");
      }
    }
    //если один размер то выбирается цветовой ряд
    else {
      color = "цветовой ряд";
    } 
    return color;
  };
  //
  var findProductSize=function(productElement){
    var sizes=[];
    productElement.find('.size .size-inner').each(function(index, obj){
      sizes.push($(obj).html());
    })
  
    return sizes;
  }
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
        var size=findProductSize(productElement);
        var color =findChosenColor(productElement);
        //у каждой страницы отдельный инпут, берем значение из текущей, если таковой нет, то 1 
        var amount = $('.cart-pro-qty input').val() || $('.single-pro-qty input').val() || 1;
        //ключи обьектов в списке состоят из id товара и цвета
        var itemId=dataId+color;
        var prod = _defineProperty({},itemId, {
          productId:dataId,
          name: name,
          img: img,
          price: price,
          amount: amount,
          size: size,
          color:color
        });

        if (addProductToCart(prod, itemId)){
          productElement.hasClass("single-product-item") ?
              productElement.find(".to-cart-btn-text").html("Добавлено") :
              productElement.find(".to-cart-btn").html("Добавлено")
        } else {
          productElement.hasClass("single-product-item") ?
              productElement.find(".to-cart-btn-text").html("В КОРЗИНУ") :
              productElement.find(".to-cart-btn").html("В КОРЗИНУ")
        }
        setCart();
      });
    }
  };

  // Функция для добавление и удаление продукта в корзине
  var addProductToCart = function (prod, dataId) {
    //Проверяем не существует ли товар в списке товаров
    if (!cart[dataId]) {
      cart = Object.assign(cart, prod);
      return true;
    } else {
      delete cart[dataId];
      return false;
    }
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
          ? (products[key].price * KGZ).toString() + kgzIcon
          : (products[key].price * USD).toString() + usdIcon;

      out += '<tr class="cart-product" data-id="' + cart[key].productId + '">';
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
        '<td class="pro-color"><span color="' +
        cart[key].color +
        '" class="chosen-color">' +
        cart[key].color +
        "</span>";
      out +=
        '<td class="pro-size size">';
        for(var i=0;i<cart[key].size.length;i++){
          out +=
            '<span class="size-inner">'+cart[key].size[i]+"</span>"+ (cart[key].size.length>1 ? ","  : "");
        }
      out+= '</td>';
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
    var $pro = $("[data-id=" + cart[id].productId + "]");

    if (!$pro) {
      return;
    }
    var totalPriceOfOneProduct = getTotalPriceOfOneProduct(cart, id);
    if($pro.find('.chosen-color').attr('color')===cart[id].color){

      $pro.find(".product-subtotal").html(totalPriceOfOneProduct.toString());
    }

  };

  // LISTENERS

  var onDeleteInCartListener = function () {
    
    $(".pro-remove a").on("click", function (event) {
      event.preventDefault();

      var dataId = $(this).closest(".cart-product").attr("data-id");
      if (dataId) {
        var color = findChosenColor($(this).closest(".cart-product"));
        delete cart[dataId+color];
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

      var size=findProductSize($button.closest(".cart-product"));
      var color = findChosenColor($button.closest(".cart-product"));

      var itemId=dataId+color;

      var prod = _defineProperty({}, itemId, {
        productId:dataId,
        name: cart[itemId].name,
        img: cart[itemId].img,
        price: cart[itemId].price,
        amount:newVal,
        size:size,
        color:color
      });

      $button.parent().find("input").val(newVal);
      setCart(prod);
      renderTotalPriceOfProducts(cart);
      reRenderTotalPriceOfOneProduct(itemId);
    });

    //  При изменение количества input-ом
    $(".cart-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".cart-product").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }
      var color = findChosenColor($input.closest(".cart-product"));
      var size = findProductSize($input.closest(".cart-product"));
    
      var itemId=dataId+color;
      var prod = _defineProperty({}, itemId, {
        productId:dataId,
        name: cart[itemId].name,
        img: cart[itemId].img,
        price: cart[itemId].price,
        amount: newVal,
        color:color,
        size:size
      });

      setCart(prod);
      renderTotalPriceOfProducts(cart);
      reRenderTotalPriceOfOneProduct(itemId);
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
    var btn = $('[data-id]').find('.to-wishlist-btn');
    //Устанавливаем текст кнопки 'в избранное', в дальнейшем установим 'добавлено',если товар есть в списке
    btn.hasClass('single-wishlist-btn')? btn.css({"background-color":'#b663d1'}) : btn.html("В ИЗБРАННОЕ");
    
    for (var key in wishList) {
      var selector = '[data-id=' +wishList[key].productId.toString() + ']';
      var toWishlistBtn = $(selector).find(".to-wishlist-btn");
      //если цвет продукта совпадает с тем что есть в списке, то меняем текст кнопки
      if (wishList[key].color === findChosenColor($(selector))) {
        toWishlistBtn.hasClass("single-wishlist-btn")
          ? toWishlistBtn.css({ "background-color": "#63D1B5" })
          : toWishlistBtn.html("ДОБАВЛЕНО");
      }
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
      var amount = productElement.find('.wishlist-pro-qty input').val() || productElement.find('.single-pro-qty input').val() || 1;
      var color = findChosenColor(productElement);
      var size = findProductSize(productElement);
      var itemId = dataId + color;

      var prod = _defineProperty({}, itemId, {
        productId:dataId,
        name: name,
        img: img,
        price: price,
        amount: amount,
        color: color,
        size:size
      });
      var toWishlistBtn = productElement.find(".to-wishlist-btn");

      if (!wishList[itemId]) {
        wishList = Object.assign(wishList, prod);
        //если кнопка имеет класс single-wishlist-btn, просто меняем фон
        toWishlistBtn.hasClass('single-wishlist-btn')? toWishlistBtn.css({"background-color":'#63D1B5'}) : toWishlistBtn.html("ДОБАВЛЕНО");
      } else {
        delete wishList[itemId];
        //если кнопка имеет класс single-wishlist-btn, просто меняем фон
        toWishlistBtn.hasClass('single-wishlist-btn')? toWishlistBtn.css({"background-color":'#b663d1'}) : toWishlistBtn.html("В ИЗБРАННОЕ") ;
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
      out += '<tr class="wishlist-product" data-id="' + wishList[key].productId + '">';
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
          '<td class="pro-color"><span color="' +
          wishList[key].color +
          '" class="chosen-color"><span class="inner-price">' +
          wishList[key].color +
          "</span>";
        out += '<td class="pro-size size">';
        for (var i = 0; i < wishList[key].size.length; i++) {
          out +=
            '<span class="size-inner">' +
            wishList[key].size[i] +
            "</span>" +
            (wishList[key].size.length > 1 ? "," : "");
        }
        out += "</td>";
      out +=
        '<td class="pro-quantity"><div class="pro-qty wishlist-pro-qty"><input type="text" value="' +
        (cart[key] ? cart[key].amount : 1) +
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
      var color=findChosenColor($button.closest(".wishlist-product"));
      var itemId=dataId+color;

      var prod = _defineProperty({}, itemId, {
        productId:dataId,
        name: wishList[itemId].name,
        img: wishList[itemId].img,
        price: wishList[itemId].price,
        amount: newVal,
        color:color,
        size:wishList[itemId].size
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
      var color = findChosenColor($input.closest(".wishlist-product"));
      var itemId=dataId+color;

      var prod = _defineProperty({}, itemId, {
        productId:dataId,
        name: cart[itemId].name,
        img: cart[itemId].img,
        price: cart[itemId].price,
        amount:newVal,
        color:color,
        size:cart[itemId].size
      });

      setWishlist(prod);
    });
  };


  var onAddToCartFromWishlistListener = function () {
    $(".to-cart-from-wishlist-btn").on("click", function (event) {
      var $button = $(event.target);
      var productId = $button.closest(".wishlist-product").attr("data-id");
      var color = findChosenColor($button.closest(".wishlist-product"));
      var product = _defineProperty({}, productId+color, wishList[productId+color]);

      var selector = $button.closest("[data-id=" + productId.toString() + "]");

      if (cart.hasOwnProperty(productId+color)) {
        delete cart[productId+color];
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
      var color = findChosenColor($(this).closest(".wishlist-product"));
      if (dataId) {
        delete wishList[dataId+color];
        setWishlist();
        renderProductsInWishlist();
      }
    });
  };


  var ifProductExistInCart = function (id) {
    //если обьекта с таким айди нет в списке false
    if(!cart.hasOwnProperty(id))return false;
    return true;
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
      numberOfProducts += parseInt(products[key]["amount"]);
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

  //устанавливаем значение инпута в single-product.html при прогрузке
  var initializeSingleProQty = function(){
    var input = $(".single-pro-qty input");
    var parent = input.closest('[data-id]');
    var dataId = $(parent).attr('data-id');
    var color = findChosenColor(parent);
    if(ifProductExistInCart(dataId+color)){
      input.val(cart[dataId+color].amount);
    }
    else{
      input.val(1);
    }
  }
  var initSingleProduct = function () {
    onColorChangeListener();
    onQuantityChangeListenersInSingle();
    initializeSingleProQty();
    findProductSize($('.single-product-item'));
  };
 //Обработчик на нажатие блока с цветом
  var onColorChangeListener = function () {
    $(".color-options .color-inner").on("click", function(){
      if($(this).hasClass('chosen-color')) $(this).removeClass('chosen-color');
      else{
        $(this).closest('.color-options').find('.color-inner').removeClass('chosen-color');
        $(this).addClass('chosen-color');
      }
      initializeSingleProQty();
      loadCart();
      loadWishList();
    })
  };
  var onQuantityChangeListenersInSingle = function () {
    /*-----
          Quantity
      --------------------------------*/
    $(".single-pro-qty").prepend(
      '<span class="dec qtybtn single-qty-btn"><i class="ti-minus"></i></span>'
    );
    $(".single-pro-qty").append(
      '<span class="inc qtybtn single-qty-btn"><i class="ti-plus"></i></span>'
    );

    // Сработает когда пользователь изменяет количество
    $(".single-qty-btn").on("click", function () {
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

      var color = findChosenColor($button.closest(".single-product-item"));
      var size = findProductSize($button.closest(".single-product-item"));
      var itemId=dataId+color;

      if(ifProductExistInCart(itemId)){
        var prod = _defineProperty({}, itemId, {
          productId:dataId,
          name: cart[itemId].name,
          img: cart[itemId].img,
          price: cart[itemId].price,
          amount:newVal,
          color:color,
          size:size
        });
        addProductToCart({},itemId);
        addProductToCart(prod,itemId);
      }

      $button.parent().find("input").val(newVal);
      setCart(prod);
    });

    //  При изменение количества input-ом
    $(".single-pro-qty input").on("input", function () {
      var $input = $(this);
      var dataId = $input.closest(".single-product-item").attr("data-id");

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)) {
        newVal = 0;
      }

      var color = findChosenColor($input.closest(".single-product-item"));
      var size = findProductSize($input.closest(".single-product-item"));
      var itemId=dataId+color;

      if(ifProductExistInCart(itemId)){
        var prod = _defineProperty({}, itemId, {
          productId:dataId,
          name: cart[itemId].name,
          img: cart[itemId].img,
          price: cart[itemId].price,
          amount:newVal,
          color:color,
          size:size
        });
        addProductToCart({},itemId);
        addProductToCart(prod,itemId);
      }

      setCart(prod);
    });
  };
  // Function for creating dynamic object keys
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  initCart();
  initWishlist();
  initCurrency();
  initSingleProduct();
})(jQuery);
