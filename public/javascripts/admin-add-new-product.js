const loader = document.querySelector(".loader-box");
const flashMessage = document.getElementById("flash-message");
const productName = document.getElementById("productname");
const productShortDesc = document.getElementById("short-desc");
const productLongDesc = document.getElementById("long-desc");
const size = document.getElementById("size");
const color = document.getElementById("color");
const fabric = document.getElementById("fabric");
const fitType = document.getElementById("fit-type");
const category = document.getElementById("category");
const originalPrice = document.getElementById("original-price");
const sellingPrice = document.getElementById("selling-price");
const stockQuantity = document.getElementById("stock-qty");
const stockStatus = document.getElementById("stock-status");
const uploadBtn = document.getElementById("upload-btn");
const uploadImageBtn = document.getElementById("uploadImage");
const images = document.getElementById("images");
const imagePath = [];


const formData = new FormData();

images.addEventListener("change", () => {
    const files = images.files;
    for (let i = 0; i < files.length; i++) {
        imagePath.push(files[i]);
        
    }
    console.log(imagePath);
});

uploadBtn.addEventListener("click", async () => {
    let productNameValue = await productName.value;
    let productShortDescValue = await productShortDesc.value;
    let productLongDescValue = await productLongDesc.value;
    let sizeValue = await size.value.split(",");
    let sizeValueArray = sizeValue.map(val => {
        if (val !== " ") {
            return val.toUpperCase();
        }
    });
    let colorValue = await color.value.split(",");
    let colorValueArray = colorValue.map(val => {
        if (val !== " ") {
            return val.toUpperCase();
        }
    });
    let fabricValue = await fabric.value;
    let fitTypeValue = await fitType.value;
    let categoryValue = await category.value;
    let originalPriceValue = await originalPrice.value;
    let sellingPriceValue = await sellingPrice.value;
    let stockQuantityValue = await stockQuantity.value;
    let stockStatusValue = await stockStatus.value;
    let imagesValue = imagePath;

    if (
        !(
            productNameValue &&
            productShortDescValue &&
            productLongDescValue &&
            sizeValueArray &&
            colorValueArray &&
            fabricValue &&
            fitTypeValue &&
            categoryValue &&
            originalPriceValue &&
            sellingPriceValue &&
            stockQuantityValue &&
            stockStatusValue &&
            imagesValue
        )
    ) {
        alert(
            "“You missed a few fields. Please fill all required details and try again.”"
        );
        return;
    }
    loader.style.display = "block";
    document.body.style.overflow = "hidden";

    formData.append("ProductName", productNameValue);
    formData.append("ProductShortDesc", productShortDescValue);
    formData.append("productLongDesc", productLongDescValue);
    formData.append("size", JSON.stringify(sizeValueArray));
    formData.append("colors", JSON.stringify(colorValueArray));
    formData.append("fabric", fabricValue);
    formData.append("fitType", fitTypeValue);
    formData.append("category", categoryValue.toLowerCase());
    formData.append("originalPrice", originalPriceValue);
    formData.append("sellingPrice", sellingPriceValue);
    formData.append("stockQuantity", stockQuantityValue);
    formData.append("stockStatus", stockStatusValue);
    imagePath.forEach((path) => {
        formData.append("images[]", path);
    });

    fetch("/upload-product", {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {

            console.log(data);
            loader.style.display = "none";
            document.body.style.overflow = "auto";
            if (data.success) {
                flashMessage.innerHTML = data.message;
                flashMessage.style.display = "block";
                setTimeout(() => {
                    flashMessage.style.display = "none";
                    flashMessage.innerHTML = "";
                    window.location.reload();
                }, 3000);
            }else{
                flashMessage.innerHTML = data.error;
                flashMessage.style.display = "block";
                flashMessage.style.backgroundColor = "red";

                setTimeout(() => {
                    flashMessage.innerHTML = "";
                    flashMessage.style.display = "none";
                    flashMessage.style.backgroundColor = "";
                    window.location.reload();
                }, 3000);
            }
            clearAllBoxes();

        })
        .catch((err) => console.error(err));
});


function clearAllBoxes(){
    productName.value = "";
    productShortDesc.value = "";
    productLongDesc.value = "";
    size.value = "";
    color.value = "";
    images.value = "";
    size.value = "";
    color.value = "";
    fabric.value = "";
    originalPrice.value = "";
    sellingPrice.value = "";
    stockQuantity.value = "";

}