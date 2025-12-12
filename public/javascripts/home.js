const newArrivalsHeaderBtn = document.querySelectorAll(
  ".new-arrivals-header-btn"
);
let products = document.querySelectorAll(".product");
const loaderBox = document.querySelector(".loader-box");
const newArrivalsBox = document.querySelector(".new-arrivals-box");
const searchBtn = document.getElementById("search-btn");
const searchBox = document.getElementById('search-box');
const menuBtn = document.getElementById("menu");
const smallScreen = document.getElementById("small-screen");
const smallXbtn = document.getElementById('small-x-btn');
const smallScreenSearch = document.getElementById("smaal-screen-search");
const smallScreenSearchBtn  = document.getElementById("small-screen-search-btn");
const categoryOptionBtn  = document.getElementById('category-option-btn');
const categoryOption  = document.getElementById('category-option');



let newArrivalBtnText;
newArrivalsHeaderBtn.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    for (let i = 0; i < 5; i++) {
      newArrivalsHeaderBtn[i].style.backgroundColor = "transparent";
    }
    btn.style.backgroundColor = "#137FEC";
    newArrivalBtnText = btn.firstElementChild.innerHTML.trim().toLowerCase();
  });
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".product")) {
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";
  }
});


newArrivalsHeaderBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (newArrivalBtnText === "t-shirt") {
      newArrivalBtnText = "tshirt";
    }
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";
    fetch("/newArrivals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: newArrivalBtnText,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          newArrivalsProductChange(data);
        } else {
          alert(data.error);
        }
        loaderBox.style.display = "none";
        document.body.style.overflow = "auto";
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  });
});

const newArrivalsProductChange = (data) => {
  newArrivalsBox.innerHTML = "";
  if (data.products.length > 0) {
    data.products.forEach((product) => {
      let anchor = document.createElement("a");
      anchor.setAttribute('href', `/product/${product._id}`);
      let child = document.createElement("div");
      child.className =
        "flex flex-col bg-white/5 rounded-xl overflow-hidden group product";
      child.innerHTML = `<div class="relative aspect-[3/4] overflow-hidden">
                      <img
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-alt="Black graphic t-shirt on a hanger."
                        src= ${product.images[0].secure_url}
                      />
                    </div>
                    <div class="flex flex-col p-4 flex-grow">
                      <h3 class="text-white font-bold text-lg line-clamp-2">${product.productName}</h3>
                      <p class="text-white/70 text-sm mt-1 mb-4 flex-grow line-clamp-2">
                        ${product.shortDescription}
                      </p>
                      <div class="flex items-baseline gap-2 mt-auto">
                        <p class="text-primary font-bold text-xl">₹${product.sellingPrice}</p>
                        <p class="text-white/50 line-through text-sm">₹${product.originalPrice}</p>
                      </div>
                    </div>`;
      anchor.appendChild(child);
      newArrivalsBox.appendChild(anchor);
    });
  } else {
    let child = document.createElement("p");
    child.className = "text-[red] text-[20px] text-center";
    child.innerHTML = "Sorry, product not available.";
    newArrivalsBox.appendChild(child);
  }
};

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

menuBtn.addEventListener("click", () => {
  smallScreen.style.display = "block";
  document.body.style.overflow = "hidden";
})

smallXbtn.addEventListener("click", () => {
  smallScreen.style.display = "";
  document.body.style.overflow = "auto";
});

smallScreenSearch.addEventListener("click", () => {
  smallScreen.style.display = "block";
  document.body.style.overflow = "hidden";
});

searchBtn.addEventListener('click', () => {
  const query = searchBox.value;
  callSerach(query);
  searchBox.value = "";
});

smallScreenSearchBtn.addEventListener("click", ()=>{
  console.log("hello")
});

function callSerach(query) {
  try {

    if (!query) {
      window.location.reload();
      return;
    };

    window.location.href = `/search/${query}`;
  } catch (err) {
    console.log(err);
  }
};

let drop = true;
categoryOptionBtn.addEventListener("click", ()=>{
  if(drop){
    categoryOption.style.display = "block";
    drop = false;
  }else{
    categoryOption.style.display = "";
    drop = true;
  }
});