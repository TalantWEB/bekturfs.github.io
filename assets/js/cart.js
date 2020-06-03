(function ($) {
  "use strict";

  let products = {};

  const setProducts = (prod, dataId) => {
    products = {...products, ...prod};
    updateProducts();
    renderTotalPriceOfProducts();
    reRenderTotalPriceOfOneProduct(dataId);
  };

  // This function called when user open any page
  const initCart = () => {

    // Загружаем существующие товары из sessionStorage
    loadProducts();

    // Если есть элемент с таким классом, вещаем обработчик событий на кнопку "В КОРЗИНУ"
    if ($(".to-cart-btn")[0]){
      $(".to-cart-btn").on('click', onClickToCartBtn);
    }

    // вызываем функцию для вывода числа выбранных товаров и общую сумму в шапке
    renderHeaderMiniCart();

    // Если есть элемент с таким классом, выводим выбранные товары
    if ($(".cart-container")[0]){
      renderProducts();
    }
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

    // Проверяем не существует ли товар в списке товаров
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

  const updateProducts = () => {
    sessionStorage.setItem("cart", JSON.stringify(products));
    renderHeaderMiniCart();
  };


  // Function for calculating total price of selected products
  const getTotalPriceOfProducts = () => {
    let totalPrice = 0;

    for (let key in products){
      totalPrice += (parseFloat(products[key].price) * parseFloat(products[key].amount))
    }

    return totalPrice;
  };

  const getTotalPriceOfOneProduct = (id) => {
    return products[id] ? parseFloat(products[id].amount) * parseFloat(products[id].price) : 0
  };

  const renderHeaderMiniCart = () => {
    let numberOfProducts = 0;
    for(let key in products){
      numberOfProducts += products[key]['amount'];
    }
    $(".header-mini-cart-amount").html(`${numberOfProducts} ($${getTotalPriceOfProducts()})`);
  };


  // CART PAGE
  // Function for rendering products to cart.html
  const renderProducts = () => {

    let out = "";

    for (let key in products){

      out += `
      <tr class="cart-product" data-id="${key}">
        <td class="pro-thumbnail"><a href="#"><img src="${products[key].img}" alt="" /></a></td>
        <td class="pro-title"><a href="#">${products[key].name}</a></td>
        <td class="pro-price"><span class="amount">$<span>${products[key].price}</span></span></td>
        <td class="pro-quantity">
            <div class="pro-qty">
                <input type="text" value="${products[key].amount}">
            </div>
        </td>
        <td class="pro-subtotal">$<span class="product-subtotal">${getTotalPriceOfOneProduct(key)}</span></td>
        <td class="pro-remove"><a href="#">×</a></td>
      </tr>
      `
    }

    $(".cart-container").html(out);

    renderTotalPriceOfProducts();
    onQuantityChangeListeners();
    onDeleteListener();
  };

  // Function for showing total price of selected products
  const renderTotalPriceOfProducts = () => {
    $(".total-amount").html(getTotalPriceOfProducts() + "$");
  };

  const reRenderTotalPriceOfOneProduct = (id) => {
    $(`[data-id="${id}"]`).find('.product-subtotal').html(getTotalPriceOfOneProduct(id));
    // $(".cart-product").attr(id).html(getTotalPriceOfOneProduct(id))
  };

  const onDeleteListener = () => {
    $('.pro-remove a').on('click', function (e) {
      e.preventDefault();

      let dataId = $(this).closest('.cart-product').attr('data-id');
      if (dataId){
        delete products[dataId];
        updateProducts();
        renderProducts();
      }
    })
  };

  const onQuantityChangeListeners = () => {
    /*-----
      Quantity
  --------------------------------*/
    $('.pro-qty').prepend('<span class="dec qtybtn"><i class="ti-minus"></i></span>');
    $('.pro-qty').append('<span class="inc qtybtn"><i class="ti-plus"></i></span>');

    // Сработает когда пользователь изменяет количество
    $('.qtybtn').on('click', function()  {

      let $button = $(this);
      let dataId = $button.closest('.cart-product').attr('data-id');

      let oldValue = $button.parent().find('input').val();
      let newVal = 1;
      if ($button.hasClass('inc')) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? (parseFloat(oldValue) - 1) : 1
      }

      let prod = { [dataId]: { name: products[dataId].name, img: products[dataId].img ,price: products[dataId].price , amount: newVal }};

      $button.parent().find('input').val(newVal);
      setProducts(prod, dataId);
    });

    //
    $('.pro-qty input').on('input', function () {

      let $input = $(this);
      let dataId = $input.closest('.cart-product').attr('data-id');

      let newVal = parseFloat($input.val());
      if (isNaN(newVal)){
        newVal = 0;
      }

      let prod = { [dataId]: { name: products[dataId].name, img: products[dataId].img ,price: products[dataId].price , amount: newVal }};

      setProducts(prod, dataId);
    })
  };

  initCart();

})(jQuery);
