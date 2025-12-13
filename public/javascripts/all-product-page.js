const loaderBox = document.querySelector(".loader-box");
let cartNumber = document.querySelector(".cart-number");
let myBagNumber = document.querySelector(".my-bag-number");
let subTotal = document.querySelector(".sub-total");
let total = document.querySelector(".total");
const cartView = document.querySelector(".cart-view");
const checkoutBtn = document.querySelector(".p-checkout");

let removedItem;
document.addEventListener("click", (e) => {
    if (e.target.closest('.remove-btn')) {
        loaderBox.style.display = "block";
        document.body.style.overflow = "hidden";
        const itemId = e.target.closest('.remove-btn').dataset.itemid;
        // console.log(itemId)
        removedItem = e.target.closest(".remove-btn").closest(".removed-item");
        removeItem(itemId);
    }
});

const removeItem = (itemid) => {

    fetch("/removeCartItem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ itemId: itemid })
    })
        .then(res => res.json())
        .then(data => {
            loaderBox.style.display = "";
            document.body.style.overflow = "auto";
            // console.log("Response:", data);
            if (data.success) {
                if (data.cartLength === 0) {
                    cartView.innerHTML = "";
                    let ele = document.createElement("p");
                    ele.className = "text-white text-[20px] text-center min-[800px]:text-[35px]";
                    ele.innerHTML = "Your cart is currently empty.";
                    cartView.appendChild(ele);
                };
                cartNumber.innerHTML = parseInt(cartNumber.innerHTML) - 1;
                removedItem.style.display = "none";
                myBagNumber.innerHTML = data.cartLength + " Items";
                subTotal.innerHTML = "₹" + data.subTotal;
                total.innerHTML = "₹" + data.total;
            }
        })
        .catch(err => {
            console.error("Error:", err);
        });
};

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        loaderBox.style.display = "block";
        document.body.style.overflow = "hidden";
    });
}

document.addEventListener("click", (e) => {
    if (e.target.closest(".product")) {
        loaderBox.style.display = "block";
        document.body.style.overflow = "hidden";
    }
});