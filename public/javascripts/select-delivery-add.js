const goBackBtn = document.querySelector(".go-back");
const loaderBox = document.querySelector(".loader-box");
const addNewAdd = document.getElementById("add-new-add");
const addForm = document.querySelector(".add-form");
const getLocationBtn = document.getElementById("get-location");
const userFullName = document.getElementById("fullName");
const userMobileNumber = document.getElementById("mobile");
const userPinCode = document.getElementById("pincode");
const userHouse = document.getElementById("addressLine1");
const userArea = document.getElementById("addressLine2");
const userCity = document.getElementById("city");
const userState = document.getElementById("state")
const deliverHereBtnForm = document.getElementById("deliver-here");
const savedAdd = document.querySelectorAll(".saved-add");
const deliverHereBoxBtn = document.querySelectorAll(".deliver-here-btn");

goBackBtn.addEventListener("click", () => {
    loaderBox.style.display = "block";
    document.body.style.overflow = "hidden";
    window.history.back();
});

let open = true;
addNewAdd.addEventListener("click", () => {
    savedAdd.forEach(box => {
        let radio = box.querySelector(".radio");
        radio.style.backgroundColor = "";
        let btn = box.querySelector(".deliver-here-btn");
        btn.style.display = "";
    })
    if (open) {
        addForm.style.display = "block";
        open = false;
    } else {
        addForm.style.display = "none";
        open = true;
    }
});

let userAddress = {
    userFullName: "",
    userMobile: "",
    userLocation: ""
};


savedAdd.forEach((box) => {
    box.addEventListener("click", (e) => {
        e.preventDefault();
        userAddress = {
            userFullName: "",
            userMobile: "",
            userLocation: ""
        };
        savedAdd.forEach(ele => {
            let btn = ele.querySelector(".deliver-here-btn");
            btn.style.display = "";
            let radioBox = ele.querySelector(".radio");
            radioBox.style.backgroundColor = "";
        });
        let username = box.querySelector(".user-name");
        userAddress.userFullName = (username.innerHTML).trim();

        let userNumber = box.querySelector(".user-phone-no");
        userAddress.userMobile = (userNumber.innerHTML).trim();

        let userLocation = box.querySelector(".user-location");
        userAddress.userLocation = (userLocation.innerHTML).trim();

        let btn = box.querySelector(".deliver-here-btn");
        btn.style.display = "block";
        let radioBox = box.querySelector(".radio");
        radioBox.style.backgroundColor = "#3a86ff";
    })
});

deliverHereBoxBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        localStorage.setItem("selectedAddress", JSON.stringify(userAddress));
        window.location.href = "/payment"
    });
});

deliverHereBtnForm.addEventListener("click", () => {
    userAddress = { userFullName: "", userMobile: "", userLocation: "" };
    if (userFullName.value === "" || userMobileNumber.value === "" || userPinCode.value === "" || userHouse.value === "" || userArea.value === "" || userCity.value === "" || userState.value === "") {
        alert("Please fill full address detail.");
        return;
    };
    userAddress.userFullName = userFullName.value;
    userAddress.userMobile = userMobileNumber.value;
    let location = `${userHouse.value}, ${userArea.value}, ${userCity.value}, ${userPinCode.value}, ${userState.value}`;
    userAddress.userLocation = location;

    localStorage.setItem("selectedAddress", JSON.stringify(userAddress));
    window.location.href = '/payment';
});

document.addEventListener("click", (e) => {
    if (e.target.closest(".product")) {
        loaderBox.style.display = "block";
        document.body.style.overflow = "hidden";
    }
});

