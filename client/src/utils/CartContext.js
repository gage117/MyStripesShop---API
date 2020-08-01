import React, { useState, createContext } from 'react';

export const CartContext = createContext('');

export const CartProvider = (props) => {

    const [cart, setCart] = useState([]);
    const [cartUUID, setCartUUID] = useState('');

    //states for cart pane
    const [state, setState] = useState({
        isPaneOpen: false,
        isPaneOpenLeft: false,
    });

    return(
        <CartContext.Provider value={[cart, setCart, state, setState]}>
        {props.children}
        </CartContext.Provider>
    )
}