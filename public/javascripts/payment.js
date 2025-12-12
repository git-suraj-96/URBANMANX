const payBox = document.querySelectorAll(".option-pay");
const upiMethod = document.getElementById("upi");
const upiBox = document.getElementById("upi-box");
const cardMethod = document.getElementById("card");
const cardBox = document.getElementById("card-box");
const codMethod = document.getElementById("cod");
const codBox = document.getElementById("cod-box");
const codBtn = document.getElementById("cod-btn");
const loaderBox = document.querySelector('.loader-box');
let paymentMethod;
let paymentStatus;
const upiPayBtn = document.getElementById('upi-pay-btn');


payBox.forEach((box) => {
  box.addEventListener("click", () => {
    payBox.forEach((ele) => {
      ele.style.border = "";
    });
    box.style.border = "2px solid rgb(11, 78, 166)";
  });
});

upiMethod.addEventListener("click", () => {
  cardBox.style.display = "none";
  codBox.style.display = "none";
  upiBox.style.display = "block";
});

codMethod.addEventListener("click", () => {
  upiBox.style.display = "none";
  cardBox.style.display = "none";
  codBox.style.display = "block";
});

cardMethod.addEventListener("click", () => {
  codBox.style.display = "none";
  upiBox.style.display = "none";
  cardBox.style.display = "block";
});

codBtn.addEventListener("click", () => {
  loaderBox.style.display = "block";
  document.body.style.overflow = "hidden";

  paymentMethod = "COD";
  paymentStatus = "Pending";
  let address = JSON.parse(localStorage.getItem("selectedAddress"));
  console.log("Payment-Method: ", paymentMethod);
  console.log("Payment-Status: ", paymentStatus);
  console.log("User-Add: ", address);

  fetch("/placeOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shippingAddress: address,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Response:", data);
      loaderBox.style.display = "";
      document.body.style.overflow = "auto";

      if (data.success) {
        window.location.href = data.redirect;
      }
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});



upiPayBtn.addEventListener("click", async () => {
  let amountText = upiPayBtn.textContent.replace(/[^0-9.]/g, "");
  let amount = Number(amountText);

  console.log("Amount Sent:", amount);

  let order = await fetch("/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  order = await order.json();

  var options = {
    key: "rzp_test_RldB4sV5LgYUzp",
    amount: order.amount, // paise
    currency: "INR",
    name: "URBANMANX",
    description: "Test Payment",
    order_id: order.id,

    handler: function (response) {
      console.log(response);

      fetch("/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      })
        .then(r => r.json())
        .then(data => {
          alert(data.success ? "Payment success" : "Payment failed");
          window.location.href = data.page;
        });
    },

    modal: {
      ondismiss: function () {
        window.location.href = '/payment-fail';
      },
    },
  };

  new Razorpay(options).open();
});
