const loaderBox = document.querySelector(".loader-box");
let fullImageView = document.querySelector(".full-image-view");
const sizeBtn = document.querySelectorAll(".size");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const toaster = document.querySelector(".toaster");
const cartNumber = document.getElementById("cart-number");


document.addEventListener("click", (e) => {
  if (e.target.closest(".product")) {
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".alt-image")) {
    const tag = e.target.closest(".alt-image");
    let bg = window.getComputedStyle(tag).backgroundImage;
    bg = bg.slice(5, -2);
    fullImageView.style.backgroundImage = `url(${bg})`;
  }
});


let size;
sizeBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    sizeBtn.forEach((ele) => {
      ele.style.backgroundColor = "";
      ele.style.border = "";
    });
    btn.style.backgroundColor = "rgb(19 127 236)";
    size = (btn.innerHTML).trim();
  });
});

addToCartBtn.addEventListener("click", () => {
  try {
    if(!(size)){
      sizeBtn.forEach((btn)=>{
        btn.style.border = "1px solid red";
      });
      toaster.innerHTML = "Please select size";
      toaster.style.display = "block";
      setTimeout(() => {
        toaster.innerHTML = "";
        toaster.style.display = "";
      }, 3000);
      return;
    }

    const productId = addToCartBtn.dataset.id;
    console.log(productId);
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";

    fetch("/addtocart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
        size: size
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response:", data);
        loaderBox.style.display = "";
        document.body.style.overflow = "auto";
        size = "";
        sizeBtn.forEach((btn)=>{
          btn.style.backgroundColor = "";
        })

        if(data.success){
            cartNumber.innerHTML = parseInt(cartNumber.innerHTML)+1;
            toaster.innerHTML = data.message;
            toaster.style.fontSize = "15px";
            toaster.style.top = '60px';
            toaster.style.display = "block";
        }else{
            toaster.innerHTML = data.error;
            toaster.backgroundColor = "red";
            toaster.style.display = "block";
        }
        setTimeout(() => {
            toaster.style.display = "none";
        }, 3000);
        
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  } catch (err) {
    console.error(err);
  }
});
