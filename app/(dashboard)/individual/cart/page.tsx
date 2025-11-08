import CartPage from "./cart";

export default function Cart() {
  return (
    <>  
    
      <div className="max-w-screen-xl mx-auto flex flex-col h-screen overflow-auto p-4 sm:p-8">
      <div className="w-full mb-6 sm:mb-10">
        <p className="text-2xl sm:text-4xl font-semibold text-center sm:text-left">Shopping Cart</p>
      </div>
      <CartPage />
    </div>
    </>

  );
}

