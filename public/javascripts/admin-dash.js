const orderDetail = document.getElementById("order-detail");
const orderDetailParId = document.getElementById("o-d-o-id");
const orderDetailOrderStatus = document.getElementById("o-d-order-status");
const orderDetailImage = document.getElementById("o-d-image");
const orderDetailName = document.getElementById("o-d-name");
const orderDetailSize = document.getElementById('o-d-size');
const orderDetailPrice = document.getElementById("o-d-price");
const orderDetailDate = document.getElementById('o-d-date');
const orderDetailPayment = document.getElementById("o-d-payment");
const orderDetailStatus = document.getElementById("o-d-status");
const orderDetailTracking = document.getElementById("o-d-tracking");
const orderDetiailCustomerName = document.getElementById('o-d-customer-name');
const orderDetailEmail = document.getElementById("o-d-email");
const orderDetailPhone = document.getElementById("o-d-phone");
const orderDetailLocation = document.getElementById("o-d-location");
const xBtn = document.getElementById('x-btn');
const orderStatusSelect = document.getElementById("status-update");
const statusUpdateBtn = document.getElementById("status-update-btn");
const loaderBox = document.querySelector('.loader-box');


let orderID;
let orderStatus;
document.addEventListener('click', (e) => {
    const child = e.target.closest("#eye-btn");

    if (child) {
        const parent = child.closest('.parent');
        orderID = child.dataset.order;

        // Now get hidden values properly
        const url = parent.querySelector(".image-url");
        const size = parent.querySelector(".size");
        const orderId = parent.querySelector("#order-id");
        orderStatus = parent.querySelector("#order-status");
        const orderPrice = parent.querySelector("#order-price");
        const customerEmail = parent.querySelector("#user-email");
        const orderDate = parent.querySelector("#order-date");
        const paymentMethod = parent.querySelector(".payment-method");
        const productName = parent.querySelector('.item-name');
        const customerName = parent.querySelector(".customer-name");
        const customerMobile = parent.querySelector(".customer-mobile");
        const customerLocation = parent.querySelector('.location')


        orderDetailParId.innerHTML = (orderId.innerHTML).trim();
        orderDetailOrderStatus.innerHTML = (orderStatus.innerHTML).trim();
        orderDetailImage.style.backgroundImage = `url('${url.innerHTML.trim()}')`;
        orderDetailName.innerHTML = (productName.innerHTML).trim();
        orderDetailSize.innerHTML = (size.innerHTML).trim();
        orderDetailPrice.innerHTML = (orderPrice.innerHTML.trim());
        orderDetailDate.innerHTML = (orderDate.innerHTML.trim());
        orderDetailPayment.innerHTML = (paymentMethod.innerHTML.trim());
        orderDetailStatus.innerHTML = (orderStatus.innerHTML).trim();
        orderDetiailCustomerName.innerHTML = customerName.innerHTML.trim();
        orderDetailPhone.innerHTML = customerMobile.innerHTML.trim();
        orderDetailLocation.innerHTML = customerLocation.innerHTML.trim();
        orderDetailEmail.innerHTML = customerEmail.innerHTML;

        orderDetail.style.display = "block"

    }
});

xBtn.addEventListener("click", () => {
    orderDetail.style.display = "";
    window.location.reload();
});

statusUpdateBtn.addEventListener("click", () => {
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";

    let statusValue = orderStatusSelect.value;
    statusValue = statusValue[0].toUpperCase() + statusValue.slice(1, statusValue.length);
    // console.log(statusValue);
    // console.log(orderID)


    fetch("/updatestatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            orderID: orderID,
            status: statusValue
        })
    })
        .then(res => res.json())
        .then(data => {
            // console.log("Response:", data);
            if(data.success){
                orderDetailStatus.innerHTML = `${statusValue}`;
                orderDetailOrderStatus.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-[#4cdf20]"></span>${statusValue}`;
                orderStatus.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-[#4cdf20]"></span>${statusValue}`;;
            }
            loaderBox.style.display = "";
            document.body.style.overflow = "auto";
        })
        .catch(err => {
            console.error("Error:", err);
        });
})