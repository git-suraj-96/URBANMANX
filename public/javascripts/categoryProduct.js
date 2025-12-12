const loaderBox = document.querySelector(".loader-box");

document.addEventListener("click", (e) => {
    if (e.target.closest(".product")) {
        loaderBox.style.display = "block";
        document.body.style.overflow = "hidden";
    }
});

window.addEventListener("pageshow", (event)=>{
  if(event.persisted){
    window.location.reload();
  }
});

window.addEventListener("pageshow", (event)=>{
  if(event.persisted){
    window.location.reload();
  }
});