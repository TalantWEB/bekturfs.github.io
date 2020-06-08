(function ($) {
  "use strict";

  var products = {};

  var setProducts = function(prod, dataId){
    products = Object.assign(products, prod);
    updateCartInSessionStorage();
  };

  // This function called when user open any page
  var initCart = function(){

    // Загружаем существующие товары из sessionStorage
    loadProducts();

    // Если есть элемент с таким классом, вещаем обработчик событий на кнопку "В КОРЗИНУ"
    if ($(".to-cart-btn")[0]){
      $(".to-cart-btn").on("click", onClickToCartBtn);
    }

    // вызываем функцию для вывода числа выбранных товаров и общую сумму в шапке
    renderHeaderMiniCart();

    // Если есть элемент с таким классом, выводим выбранные товары
    if ($(".cart-container")[0]){
      renderProducts();
    }

    updateCartBtnListener();
  };

  // Function for loading selected products from sessionStorage
  var loadProducts = function(){
    if (sessionStorage.getItem("cart")) {
      products = JSON.parse(sessionStorage.getItem("cart"));
    }

    for (var key in products){
      var selector = '[data-id=' + key.toString() + ']';
      $(selector).find(".to-cart-btn").html("Добавлено");
    }
  };

  var onClickToCartBtn = function(event){
    var element = event.target;
    var productElement = $(element).closest(".product-item");
    productElement = $(productElement);

    var dataId = productElement.attr("data-id");
    var img = productElement.find(".image img").attr("src");
    var name = productElement.find(".title a").html();
    var price = productElement.find(".inner-price").html();
    var size = productElement.find(".size .size-inner").first().html();
    var color = productElement.find(".color .color-inner").first().css("background-color");

    var prod = { [dataId]: {name, img, price, amount: 1, size, color} };

    addProductToCart(prod, dataId, productElement)
  };

  // Add or delete products in cart
  var addProductToCart = function(prod, dataId, productsElement){

    // Проверяем не существует ли товар в списке товаров
    if (!products[dataId]){
      products = Object.assign(products, prod);
      productsElement.find(".to-cart-btn").html("Добавлено");
    } else {
      delete products[dataId];
      productsElement.find(".to-cart-btn").html("В корзину");
    }

    sessionStorage.setItem("cart", JSON.stringify(products));
    renderHeaderMiniCart()
  };

  var updateCartInSessionStorage = function(){
    sessionStorage.setItem("cart", JSON.stringify(products));
    renderHeaderMiniCart();
  };


  // Function for calculating total price of selected products
  var getTotalPriceOfProducts = function(){
    var totalPrice = 0;

    for (var key in products){
      totalPrice += (parseFloat(products[key].price) * parseFloat(products[key].amount))
    }

    return totalPrice;
  };

  var getTotalPriceOfOneProduct = function(id){
    return products[id] ? parseFloat(products[id].amount) * parseFloat(products[id].price) : 0
  };

  var renderHeaderMiniCart = function(){
    var numberOfProducts = 0;
    for(var key in products){
      numberOfProducts += products[key]['amount'];
    }
    $(".header-mini-cart-amount").html(numberOfProducts + '($' + getTotalPriceOfProducts() + ')');
  };


  // CART PAGE
  // Function for rendering products to cart.html
  var renderProducts = function(){

    var out = "";

    for (var key in products){

      out += '<tr class="cart-product" data-id="' + key + '">';
        out += '<td class="pro-thumbnail"><a href="#"><img src="' + products[key].img + '" alt="" /></a></td>';
        out += '<td class="pro-title"><a href="#">' + products[key].name + '</a></td>';
        out += '<td class="pro-price"><span class="amount">$<span>' + products[key].price + '</span></span></td>';
        out += '<td class="pro-quantity"><div class="pro-qty"><input type="text" value="' + products[key].amount + '"></div></td>';
        out += '<td class="pro-subtotal">$<span class="product-subtotal">' + getTotalPriceOfOneProduct(key) + '</span></td>';
        out += '<td class="pro-remove"><a href="#">×</a></td>';
      out += '</tr>'

    }

    $(".cart-container").html(out);

    renderTotalPriceOfProducts();
    onQuantityChangeListeners();
    onDeleteListener();
  };

  // Function for showing total price of selected products
  var renderTotalPriceOfProducts = function(){
    $(".total-amount").html(getTotalPriceOfProducts() + "$");
  };

  var reRenderTotalPriceOfOneProduct = function(id){
    $('[data-id="' + id + '"]').find('.product-subtotal').html(getTotalPriceOfOneProduct(id));
  };

  var onDeleteListener = function(){
    $('.pro-remove a').on('click', function (e) {
      e.preventDefault();

      var dataId = $(this).closest('.cart-product').attr('data-id');
      if (dataId){
        delete products[dataId];
        updateCartInSessionStorage();
        renderProducts();
      }
    })
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
      var dataId = $button.closest('.cart-product').attr('data-id');

      var oldValue = $button.parent().find('input').val();
      var newVal = 1;
      if ($button.hasClass('inc')) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? (parseFloat(oldValue) - 1) : 1
      }

      var prod = { [dataId]: { name: products[dataId].name, img: products[dataId].img ,price: products[dataId].price , amount: newVal }};

      $button.parent().find('input').val(newVal);
      setProducts(prod, dataId);
      renderTotalPriceOfProducts();
      reRenderTotalPriceOfOneProduct(dataId);
    });

    //
    $('.pro-qty input').on('input', function () {

      var $input = $(this);
      var dataId = $input.closest('.cart-product').attr('data-id');

      var newVal = parseFloat($input.val());
      if (isNaN(newVal)){
        newVal = 0;
      }

      var  prod = { [dataId]: { name: products[dataId].name, img: products[dataId].img ,price: products[dataId].price , amount: newVal }};

      setProducts(prod, dataId);
    })
  };

  var updateCartBtnListener = function(){
    $('.cart-buttons input').on('click', function (event) {
      event.preventDefault();

      for (var key in products){
        products[key]['amount'] = 1;
      }

      updateCartInSessionStorage();
      renderProducts();
    })
  };


  initCart();

})(jQuery);
