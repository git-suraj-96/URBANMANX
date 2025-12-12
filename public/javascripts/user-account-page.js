let sidebarBtns = document.querySelectorAll(".sidebar-button");
const profileBtn = document.getElementById("profile");
const myOrderBtn =document.getElementById('my-order');
const myAddBtn = document.getElementById("my-add");
const profileDetail = document.getElementById("profile-detail");
const orderDetail = document.getElementById("order-detail");
const addDetail = document.getElementById("add-detail");
const editProfileBtn = document.getElementById("edit-profile");
const profileSaveBtn = document.getElementById('profile-save-btn');
const editProfileForm = document.getElementById('edit-profile-form');
const profileXBtn = document.getElementById('profile-x-btn');

sidebarBtns.forEach(btn => {
    btn.addEventListener("click", ()=>{
        sidebarBtns.forEach(ele =>{
            ele.style.background = "none";
            ele.querySelector("p").style.color = "grey";
        })
        btn.style.backgroundColor = "#137fec";
        btn.querySelector('p').style.color = "white";
    })
});

myOrderBtn.addEventListener("click", ()=>{
    profileDetail.style.display = "none";
    addDetail.style.display = "none";
    orderDetail.style.display = "block";
});

profileBtn.addEventListener("click", ()=>{
    profileDetail.style.display = "block";
    addDetail.style.display = "none";
    orderDetail.style.display = "none";
});

myAddBtn.addEventListener("click", ()=>{
    profileDetail.style.display = "none";
    addDetail.style.display = "block";
    orderDetail.style.display = "none";
});

editProfileBtn.addEventListener("click", ()=>{
    editProfileForm.style.display = 'block';
    document.body.style.overflow = "hidden";
});

profileXBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    editProfileForm.style.display  = "";
    document.body.style.overflow = "auto";
    
}, true)