// import { useEffect, useRef } from "react";
// import { useCart } from "../../contexts/CartContext";

// type Props = {
//   open: boolean;
//   anchorRef?: React.RefObject<HTMLElement>;
//   onClose: () => void;
// };

// export default function CartPopover({ open, onClose }: Props){
//   const wrapRef = useRef<HTMLDivElement|null>(null);
//   const { cart, totalPrice, setQuantity, removeFromCart, clearCart } = useCart();

//   // outside click to close
//   useEffect(() => {
//     function onDoc(e: MouseEvent){
//       const t = e.target as Node;
//       if (wrapRef.current && !wrapRef.current.contains(t)) onClose();
//     }
//     if(open){
//       document.addEventListener("mousedown", onDoc);
//       return () => document.removeEventListener("mousedown", onDoc);
//     }
//   }, [open, onClose]);

//   if(!open) return null;

//   return (
//     <div ref={wrapRef} className="cart-popover" role="dialog" aria-label="Cart">
//       {cart.length === 0 ? (
//         <p className="cart-empty">No products in the cart.</p>
//       ) : (
//         <>
//           <div className="cart-list">
//             {cart.map(it => (
//               <div key={it.key} className="cart-row">
//                 {it.image && <img className="cart-img" src={it.image} alt="" />}
//                 <div className="cart-info">
//                   <div className="cart-title">
//                     {it.title} <span className="tag">{it.type}</span>
//                   </div>

//                   <div className="cart-meta">
//                     <span>BDT {it.price}</span>
//                   </div>

//                   <div className="qty">
//                     <button onClick={() => setQuantity(it.key, it.quantity - 1)} aria-label="decrease">-</button>
//                     <input
//                       value={it.quantity}
//                       onChange={e => setQuantity(it.key, Number(e.target.value) || 1)}
//                       aria-label="quantity"
//                     />
//                     <button onClick={() => setQuantity(it.key, it.quantity + 1)} aria-label="increase">+</button>
//                   </div>
//                 </div>

//                 <button className="remove" onClick={() => removeFromCart(it.key)} aria-label="remove">×</button>
//               </div>
//             ))}
//           </div>

//           <div className="cart-footer">
//             <div className="subtotal">Subtotal: BDT {totalPrice.toFixed(2)}</div>
//             <div className="actions">
//               <button onClick={clearCart}>Clear</button>
//               <a href="/cart" className="btn btn-primary" onClick={onClose}>Go to cart</a>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
