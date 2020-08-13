import React, { useState, useContext, useEffect } from 'react';
import SlidingPane from "react-sliding-pane";
import { useHistory, useLocation } from 'react-router-dom';

//assets
import { CartContext } from '../utils/CartContext';

//routes


//components
import Image from "../components/Image";

//stlye
import "react-sliding-pane/dist/react-sliding-pane.css";
import "../stylesheets/Cart.scss";
import NumberBubble from './NumberBubble';


export const HandleQuantity = ({ product }) => {

  const { cart, setCart } = useContext(CartContext);
  //adds 1 to quantity
  const increment = (e) => {
    const nameAttr = e.target.getAttribute("name")
    console.log(cart);
    let newCart = [...cart];
    const itemInCart = newCart.find(
      (item) => nameAttr === item.sku
    );

    if (itemInCart) {
      let basePrice = itemInCart.totalProductPrice / itemInCart.quantity;
      itemInCart.quantity++;
      itemInCart.totalProductPrice = basePrice * itemInCart.quantity;
    }
    setCart(newCart);
  }

  //minus 1 from quanitity
  const decrement = (e) => {
    const nameAttr = e.target.getAttribute("name")
    console.log(cart);
    let newCart = [...cart];
    const itemInCart = newCart.find(
      (item) => nameAttr === item.sku
    );

    if (itemInCart) {
      if (itemInCart.quantity > 1) {
        let basePrice = itemInCart.totalProductPrice / itemInCart.quantity;
        --itemInCart.quantity;
        itemInCart.totalProductPrice = basePrice * itemInCart.quantity;
        setCart(newCart);
      } else setCart(cart.filter(lineItem => lineItem.sku !== nameAttr));
    }
  }

  return (
    <>
      <div className="cart-options">
        <div className="quantity-input">
          <button name={product.sku} className="quantity-input__modifier quantity-input__modifier--left" onClick={decrement}>
            &mdash;
                </button>
          <input className="quantity-input__screen" type="number" value={product.quantity} max={product.quantity_available} readOnly />
          <button name={product.sku} className="quantity-input__modifier quantity-input__modifier--right" onClick={increment}>
            &#xff0b;
                </button>
        </div>
      </div>
    </>
  )

}

//cart item component to insert into cart pane
export const CartItem = ({ displayQuantity, displayRemove, displayTotalProdPrice, numBub }) => {

  const { cart, setCart } = useContext(CartContext);
  console.log(cart);

  const location = useLocation();

  //removes cart item based on sku.
  const remove = (e) => {
    const nameAttr = e.target.getAttribute("name")
    setCart(cart.filter(lineItem => lineItem.sku !== nameAttr));
  };

  //converts size abbr to word
  const getSize = (size) => {
    if (size === "XS") {
      return "X-SMALL";
    } else if (size === "S") {
      return "SMALL";
    } else if (size === "M") {
      return "MEDIUM";
    } else if (size === "L") {
      return "LARGE";
    } else if (size === "XL") {
      return "X-LARGE";
    } else if (size === "XXL") {
      return "XX-Large";
    } else if (size === "XXXL") {
      return "XXX-LARGE";
    }
  }


  return (
    <>
      {/*lists all items in cart*/}
      {cart.map((product, index) => (
        <div className="cart-item" key={index}>
          <div className="cart-image">
            <Image
              to={"/Products/" + product.base_sku}
              imgDivClass='img-div-cart-page'
              imgClass='product-img'
              product={product}
              numBub={numBub && product.quantity}
            />
          </div>
          <div className="cart-info">
            <h2><strong>{product.name}</strong></h2>
            <span><p>{getSize(product.size)} ~ {product.color.toUpperCase()}</p></span>
            <span>${displayTotalProdPrice ? product.totalProductPrice : product.price}</span>{displayRemove && <span className="cart-remove" name={product.sku} onClick={remove}>Remove</span>}
            {displayQuantity &&
              <HandleQuantity
                product={product}
              />}
          </div>
        </div>
      ))}
    </>
  );
}


export const Cart = () => {

  //used to pass cart array
  const { cart, isPaneOpen, setIsPaneOpen } = useContext(CartContext);

  //set panes width
  const [windowWidth, setWindowWidth] = useState(0);
  let resizeWindow = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  //gets total price
  function getTotalPrice() {
    return cart.reduce((sum, { totalProductPrice }) => sum + totalProductPrice, 0);
  };

  let totalPrice = getTotalPrice();

  // useHistory for changing routes
  const history = useHistory();

  // onClick function that goes to checkout and closes cart pane
  const goToCheckout = () => {
    history.push('/Checkout');
    setIsPaneOpen(false);
  }

  const openCart = () => {
    setIsPaneOpen(true);
  }

  return (
    <>
      <div className="cart-wrapper">
        {/*cart button*/}
        <i className="fa fa-shopping-cart cart" aria-hidden="true" onClick={openCart}></i>
      </div>

      {/*pane and its contents*/}
      <SlidingPane
        className="cart-pane"
        overlayClassName="cart-overlay"
        isOpen={isPaneOpen}
        title="CART"
        width={windowWidth >= 380 ? "360px" : "90%"}
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setIsPaneOpen(false);
          window.scrollTo(0, 0);
        }}
      >
        <CartItem
          displayQuantity={true}
          displayRemove={true}
          displayTotalProdPrice={false}
        />
        <input type="submit" value={"CHECKOUT ~ $" + totalPrice} onClick={goToCheckout} />
      </SlidingPane>
      {/*responsive pane*/}

    </>
  );
};
