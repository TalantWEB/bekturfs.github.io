(function ($) {
  "use strict";

  let wishList = {};

  const setWishlist = (prod) => {
    wishList = {...wishList, ...prod};
    updateWishlist();
  };

  const updateWishlist = () => {
    Cookies.set("wishlist", JSON.stringify(wishList));
  };

  // This function called when user open
  const initWishlist = () => {
    loadWishList();

    $(".to-wishlist-btn").on("click", addProductToWishList);

    renderHeaderMiniWishList();
    renderWishList();
  };

  // Function for loading selected products from sessionStorage
  const loadWishList = () => {
    if (Cookies.get("wishlist")) {
      wishList = JSON.parse(Cookies.get("wishlist"));
    }

    for (let key in wishList) {
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

    let prod = { [dataId]: { name, img, price, amount: 1 } };

    if (!wishList[dataId]) {
      wishList = { ...prod, ...wishList };
      productElement.find(".to-wishlist-btn").html("Добавлено");
    } else {
      delete wishList[dataId];
      productElement.find(".to-wishlist-btn").html("В избранное");
    }

    Cookies.set("wishlist", JSON.stringify(wishList));
    renderHeaderMiniWishList();
  };

  const renderHeaderMiniWishList = () => {
    let numberOfProducts = Object.keys(wishList).length;
    $(".wishlist-amount").html(numberOfProducts);
  };

  // WISHLIST PAGE
  // Function for rendering products to wishList.html
  const renderWishList = () => {
    let out = "";

    for (let key in wishList) {
      out += `<tr class='product-item' data-id='${key}'>`;
      out +=
        '<td class="pro-thumbnail image"><a href="#"><img src="' +
        wishList[key].img +
        '" alt="" /></a></td>';
      out +=
        '<td class="pro-title title"><a href="#">' +
        wishList[key].name +
        "</a></td>";
      out += `<td class="pro-price"><span class="amount">$ <span class="inner-price">${wishList[key].price}</span> `;
      out +=
        '<td class="pro-quantity"><div class="pro-qty"><input type="text" class="pro-qty-input" value="' +
        wishList[key].amount +
        '"></div></td>';
      out += `<td class="pro-add-cart"><a class="to-cart-btn">В корзину</a></td>`;
      out += '<td class="pro-remove"><a>×</a></td>';
      out += "</tr>";
    }

    $(".wishlist-container").html(out);

    onQuantityChangeListeners();
    onDeleteListener()
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
      let dataId = $button.closest('.product-item').attr('data-id');

      let oldValue = $button.parent().find('input').val();
      let newVal = 1;
      if ($button.hasClass('inc')) {
        newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below one
        newVal = oldValue > 1 ? (parseFloat(oldValue) - 1) : 1
      }

      let prod = { [dataId]: { name: wishList[dataId].name, img: wishList[dataId].img ,price: wishList[dataId].price , amount: newVal }};

      $button.parent().find('input').val(newVal);
      setWishlist(prod);
    });

    //
    $('.pro-qty input').on('input', function () {

      let $input = $(this);
      let dataId = $input.closest('.cart-product').attr('data-id');

      let newVal = parseFloat($input.val());
      if (isNaN(newVal)){
        newVal = 0;
      }

      let prod = { [dataId]: { name: wishList[dataId].name, img: wishList[dataId].img ,price: wishList[dataId].price , amount: newVal }};

      setWishlist(prod);
    })
  };

  const onDeleteListener = () => {
    $(".pro-remove a").on("click", (e) => {
      //Удаление из избранных при нажатии на крест в таблице
      //отменяем дефолтное поведение кнопки
      e.preventDefault();
      //функция удаляет обьект из избранных, если она уже в избранных
      addProductToWishList(e);
      //Находим родительскую строку
      let parent = e.target.closest(".product-item");
      //удаляем ее из таблицы
      parent.parentNode.removeChild(parent).fadeOut();
    });
  };

  initWishlist();
})(jQuery);
