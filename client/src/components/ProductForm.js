import React, { useContext, useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactDOM from 'react-dom';
//style
import '../stylesheets/ProductForm.scss';
//components
import Header from '../components/Header';
//context
import { CartContext } from '../utils/CartContext';
// localStorage and UUID for identifying users
import localStorage from '../utils/localStorage';
import { v4 as uuid } from 'uuid';
// api to create cart if needed
import axios from '../utils/axios';

const ProductForm = (props) => {

    const { products } = props;

    //creates states for colors and sizes and clears null amount
    const [colors, setColors] = useState([]);
    colors.splice(0, colors.length);
    products.map(product => colors.includes(product.color) ? null : colors.push(product.color));

    const [sizes, setSizes] = useState([]);
    sizes.splice(0, sizes.length);
    products.map(product => sizes.includes(product.size) ? null : sizes.push(product.size));

    //creates react-hook-form and components
    const { handleSubmit, register, errors, reset } = useForm();
    const { cart, setCart, setIsPaneOpen, setCartUUID } = useContext(CartContext);

    //used to reset colors and sizes
    const [resetButton, setResetButton] = useState(false);

    const resetOptions = () => {
        //resets button
        setResetButton(!resetButton);
        //re-maps all colors and sizes to base_sku product
        products.map(product => colors.includes(product.color) ? null : colors.push(product.color));
        products.map(product => sizes.includes(product.size) ? null : sizes.push(product.size));
        console.log(colors);
        console.log(sizes);
    }


    //add to cart button
    const onSubmit = (values) => {
        // Check if user has UUID stored, if not: create one, store it in LocalStorage and cartContext
        if (!localStorage.hasUUID()) {
            const UUID = uuid();
            localStorage.setItem(UUID);
            setCartUUID(UUID);
            // Create new Cart in Database
            axios.post('/carts', { UUID });
        };

        //creates duplicate
        let newCart = [...cart];

        //looks for product in that size and color
        const product = products.find(
            (item) => (values.color === item.color) && (values.size === item.size)
        );

        //if no product exists
        if (!product) {
            console.log("OUT OF STOCK!");
        } else {

            //looks to see if item exists in cart
            const itemInCart = newCart.find(
                (item) => product.sku === item.sku
            );

            //if exists increment quantity and set new price. else push new line item
            if (itemInCart) {
                let basePrice = itemInCart.price / itemInCart.quantity;
                itemInCart.quantity++;
                itemInCart.price = basePrice * itemInCart.quantity;
                axios.patch('/carts/lineitem', {
                    UUID: localStorage.getItem(),
                    product_sku: itemInCart.product_sku,
                    quantity: itemInCart.quantity
                });
            } else {
                const lineItem = { base_sku: product.base_sku, sku: product.sku, name: product.name, price: (product.price_cents / 100), color: values.color, size: values.size, photo_url: product.photo_url, quantity: 1, quantity_available: product.quantity_available };
                newCart.push(lineItem);
                axios.post('/carts/lineitem', {
                    line_item: {
                        quantity: lineItem.quantity,
                        product_sku: lineItem.sku,
                        cart_id: localStorage.getItem()
                    }
                });
            }
            //sets cart and opens pane
            setCart(newCart);
            setIsPaneOpen(true);
        }
    };



    function handleChange(e) {
        //prints value selected
        console.log(e.target.value);

        //shows reset button
        if (e.target.value && !resetButton) {
            setResetButton(!resetButton);
        }

        //filters to all sizes of value selected
        const productsSelected = products.filter(product => (e.target.value === product.color) || (e.target.value === product.size));

        //deletes all elements and maps new ones??
        colors.splice(0, colors.length);
        productsSelected.map(item => colors.includes(item.color) ? null : colors.push(item.color));
        sizes.splice(0, sizes.length);
        productsSelected.map(item => sizes.includes(item.size) ? null : sizes.push(item.size));

        //re-maps them into Colors and Sizes
        render();
        console.log(colors);
        console.log(sizes);
    }

    //renders colors and sizes
    function render() {
        const listColors = (
            <ul>
                {errors.color && (<p>COLOR IS REQUIRED.</p>)}
                {colors.map((color, index) => (
                    <li className={color} key={index}>
                        <input type="radio" name="color" id={color} value={color} onChange={handleChange} ref={register({ required: true })} />
                        <label className={color} htmlFor={color}><span className={color}></span><span className={color + "__selector"} /></label>
                    </li>
                ))}
            </ul>
        );
        ReactDOM.render(listColors, document.getElementById('Colors'));

        const listSizes = (
            <ul>
                {errors.size && (<p>SIZE IS REQUIRED.</p>)}{/*Need to make better with scss*/}
                {sizes.map((size, index) => (
                    <li className={size} key={index}> {/*<--prop used for showing out of order (not made yet)*/}
                        <input type="radio" name="size" id={size} value={size} onChange={handleChange} ref={register({ required: true })} />
                        <label htmlFor={size}><span className={size}>{size}</span></label>
                    </li>
                ))}
            </ul>
        );
        ReactDOM.render(listSizes, document.getElementById('Sizes'));

    }

    //renders all colors and sizes first. ***there might be a better way to do this******
    setTimeout(render, 1);

    return (
        <form method="post" className="ProductForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="ProductOptions">
                <div className="ProductSelect">

                    {/*RESET BUTTON*/}
                    <input
                        className={resetButton ? "selected" : null}
                        type="reset"
                        onClick={() => resetOptions()}
                        value="RESET"
                    />

                    <Header
                        title="COLOR"
                        headerClass="Other-Header"
                        divClass="Container-Header"
                        hClass="Product-Header Padding"
                        subHClass="No-Sub"
                    />

                    {/*Colors*/}
                    <div id="Colors" className="Colors">

                    </div>

                    {/*Header for sizes*/}
                    <Header
                        title="SIZES"
                        headerClass="Other-Header"
                        divClass="Container-Header"
                        hClass="Product-Header Padding"
                        subHClass="No-Sub"
                    />

                    {/*sizes you can pick*/}
                    <div id="Sizes" className="Sizes">
                    
                    </div>

                    {/*ADDS TO CART*/}
                    <input
                        type="submit"
                        value="ADD TO CART"
                    />

                </div>
            </div>
        </form>
    );
};


export default ProductForm;