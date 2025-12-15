require("dotenv").config();

var express = require("express");
var router = express.Router();

const userModel = require("./users");
const productModel = require("./product");
const orderModel = require('./order');

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { nanoid } = require('nanoid');

var Razorpay = require("razorpay");
var crypto = require("crypto");

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// multer setup
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// cloudinary-setup
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// It will send email using gmail.
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// transporter.verify((err) => {
//   if (err) console.log("SMTP ERROR:", err);
//   else console.log("SMTP READY");
// });

const pincodes = require('india-pincode-lookup');



// ----------- User routes ------------------
/* GET home page. */
router.get("/", isLoggedIn, async function (req, res) {
  const allProducts = await productModel.aggregate([
    { $addFields: { random: { $rand: {} } } },
    { $sort: { random: 1 } },
    { $project: { random: 0 } },
  ]);

  const newArrivals = await productModel.aggregate([
    {
      $sample: { size: 4 },
    },
  ]);

  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findOne({ email: decode.email });

  let cart = user.cart;

  console.log(process.env.EMAIL_PASS);
  console.log(process.env.EMAIL_USER);


  res.render("home", { allProducts, newArrivals, cart });
});

// Get category-product page
router.get("/categoryProductPage", isLoggedIn, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findOne({ email: decode.email });
  const cart = user.cart;
  res.render("category-product-page", { cart });
});

// Get explore/category routes
router.get("/Explore/:category", isLoggedIn, async function (req, res) {
  try {
    let category = req.params.category;
    let products;
    if (category === "newarrivals" || category === "superdeals") {
      products = await productModel.aggregate([{ $sample: { size: 200 } }]);
    } else {
      products = await productModel.find({ category: category });
    }

    if (category === "tshirt") {
      category = "T-SHIRT";
    } else if (category === "shirt") {
      category = "SHIRT";
    } else if (category === "cargo") {
      category = "CARGO";
    } else if (category === "bottoms") {
      category = "BOTTOMS";
    }
    // console.log(products);
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findOne({ email: decode.email })
      .populate("recentlyView");
    const recentlyViewProducts = user.recentlyView;
    const cart = user.cart;
    res.render("category-product-page", {
      products,
      category,
      recentlyViewProducts,
      cart,
    });
  } catch (err) {
    console.log(err);
  }
});

// New arrvals product
router.post("/newArrivals", isLoggedIn, async (req, res) => {
  try {
    const { category } = req.body;
    // console.log(category);
    let products;
    if (category === "all products") {
      products = await productModel.aggregate([{ $sample: { size: 4 } }]);
    } else {
      products = await productModel.aggregate([
        { $match: { category: category } },
        { $limit: 4 },
      ]);
    }
    console.log(products);
    if (products) {
      return res.json({
        success: true,
        products: products,
      });
    } else {
      return res.json({
        success: false,
        error: "Internal fetching error...",
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      error: "Internal Server Error...",
    });
  }
});

// Get product detail page
router.get("/product/:productId", isLoggedIn, async (req, res) => {
  try {
    let productId = req.params.productId;

    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    let user = await userModel.findOne({ email: decode.email });

    if (!user.recentlyView.includes(productId)) {
      if (user.recentlyView.length > 20) {
        user.recentlyView.pop();
      }
      user.recentlyView.unshift(productId);
      await user.save();
    }

    user = await userModel
      .findOne({ email: decode.email })
      .populate("recentlyView");
    const recentlyViewProducts = user.recentlyView;
    const cart = user.cart;
    let product = await productModel.findById(productId);
    res.render("product-detail-page", { product, recentlyViewProducts, cart });
  } catch (err) {
    console.log(err);
  }
});

// Search Bar Handler Route
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query.trim();
    const keywords = query.split(/\s+/); // split on spaces
    const allProducts = await productModel.find();

    let resultArray = [];

    for (let product of allProducts) {
      let text = `
        ${product.productName}
        ${product.shortDescription}
        ${product.longDescription}
        ${product.fitType}
      `.toLowerCase();

      // check if all keywords match
      let matched = keywords.every(word => {
        let regex = new RegExp(word, "i");
        return regex.test(text);
      });

      if (matched) resultArray.push(product);
    }

    console.log("result:", resultArray);

    const token = req.cookies.token;
    let user;

    if (token) {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      user = await userModel.findOne({ email: decode.email }).populate('recentlyView');
    }

    res.render("category-product-page", {
      products: resultArray,
      recentlyViewProducts: user.recentlyView,
      cart: user.cart,
      category: null
    });

  } catch (err) {
    console.log(err);
    res.render("error", { message: err });
  }
});



// add item to cart
router.post("/addtocart", isLoggedIn, async function (req, res) {
  try {
    const { productId, size } = req.body;

    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decode.email });

    const cartElement = {
      productId: productId,
      size: size,
    };

    // console.log(cartElement);

    user.cart.unshift(cartElement);
    await user.save();

    return res.json({
      success: true,
      id: productId,
      message: "Items added to in your cart successfully.",
    });
  } catch (err) {
    return res.json({
      success: false,
      error: "Internal server error...",
    });
  }
});

// Get shooping cart page
router.get("/shopping-cart-page", isLoggedIn, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findOne({ email: decode.email })
      .populate({
        path: "cart",
        populate: { path: "productId" },
      })
      .populate("recentlyView");
    const cart = user.cart;
    let subTotal = 0;
    for (let item of cart) {
      subTotal += item.productId.sellingPrice;
    }
    let total = subTotal + 50;
    const recentlyView = user.recentlyView;
    total = total.toLocaleString("en-IN");
    subTotal = subTotal.toLocaleString("en-IN");
    res.render("all-cart-page", { cart, subTotal, total, recentlyView });
  } catch (err) {
    console.log(err);
  }
});

// Delete cart item
router.post("/removeCartItem", isLoggedIn, async (req, res) => {
  try {
    const { itemId } = req.body;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    let user = await userModel.findOne({ email: decode.email });

    // console.log(user);

    let removed = false;
    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].productId.toString() === itemId) {
        user.cart.splice(i, 1);
        await user.save();
        removed = true;
        break;
      }
    }

    user = await userModel.findOne({ email: decode.email }).populate({
      path: "cart",
      populate: { path: "productId" },
    });
    // console.log(user);

    let subTotal = 0;
    for (let val of user.cart) {
      subTotal += val.productId.sellingPrice;
    }

    let total = subTotal + 50;

    subTotal = subTotal.toLocaleString("en-IN");
    total = total.toLocaleString("en-IN");

    if (removed) {
      return res.json({
        success: true,
        message: "Item removed from your cart successfully.",
        subTotal: subTotal,
        total: total,
        cartLength: user.cart.length,
      });
    } else {
      return res.render("error");
    }
  } catch (err) {
    console.log(err);
    res.render("error");
  }
});

// Get select delivery address page
router.get("/selectAdd", isLoggedIn, async function (req, res) {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findOne({ email: decode.email })
      .populate({
        path: "cart",
        populate: {
          path: "productId",
        },
      });
    const savedAddress = user.address;
    console.log(savedAddress)
    const cartItems = user.cart;
    let subTotal = 0;
    for (let val of cartItems) {
      subTotal += (val.productId.sellingPrice);
    };
    let total = 50 + subTotal;
    subTotal = subTotal.toLocaleString("en-IN");
    total = total.toLocaleString("en-IN");
    res.render("select-delivery-address", { cartItems, subTotal, total, savedAddress });
  } catch (err) {
    res.render("error");
    console.log(err);
  }

});

// Get payment page
router.get('/payment', isLoggedIn, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decode.email }).populate({
      path: 'cart',
      populate: { path: "productId" }
    });

    if (user.cart.length < 1) {
      res.redirect('/');
      return;
    }

    let subTotal = 0;
    for (let val of user.cart) {
      subTotal += val.productId.sellingPrice;
    };

    let total = subTotal + 50;
    total = total.toLocaleString('en-IN');
    subTotal = subTotal.toLocaleString('en-IN');

    res.render("payment", { total, subTotal });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
});

// Placed order
router.post('/placeOrder', isLoggedIn, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentStatus } = req.body;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decode.email }).populate({
      path: 'cart',
      populate: { path: 'productId' }
    });

    // ADD ADDRESS ONLY ONCE
    let push = true;
    for (let val of user.address) {
      if (JSON.stringify(val) === JSON.stringify(shippingAddress)) {
        push = false;
        break;
      }
    }

    if (push) {
      user.address.push(shippingAddress);
      await user.save();
    }

    const cartItems = user.cart;

    let createdOrderid = [];

    // ❌ forEach(async...)  → WRONG
    // ✅ use for...of (works sequentially)
    let createdOrder;
    for (const item of cartItems) {
      const obj = {
        product: item.productId._id,
        quantity: 1,
        size: item.size
      };
      createdOrder = await orderModel.create({
        user: user._id,
        products: obj,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        orderId: `ORD-${nanoid(8)}`
      });

      createdOrderid.push(createdOrder._id);

      const sellerId = item.productId.sellerId;
      const seller = await userModel.findById(sellerId);
      seller.adminOrder.unshift(createdOrder._id);
      await seller.save();
    }

    // SAVE USER ONLY ONCE AFTER LOOP
    if (createdOrderid.length > 0) {
      user.cart = [];

      for (let id of createdOrderid) {
        user.userOrder.push(id);
      }

      await user.save();

      sendMail(user.email, `✅ Your Order is Confirmed – #${createdOrder.orderId}`, "Delivery Expected Soon!" );
      sendMail("surajara96@gmail.com", `🛒 New Order Received – Order #${createdOrder.orderId}`, `Hello Admin, \nCustomerName:- ${shippingAddress.userFullName}\nCustomer Email: ${user.email}\nPayment Status: ${paymentMethod}`);

      return res.json({
        redirect: "/orderconfirm",
        success: true
      });
    } else {
      return res.render("error", { message: "Something went wrong." });
    }

  } catch (err) {
    console.log(err);
    res.render("error");
  }
});


// Get order-confirmation page
router.get('/orderconfirm', isLoggedIn, (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    res.render('order-confirmation', { email: decode.email });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
});

// Get page after payment fail
router.get('/payment-fail', (req, res) => {
  res.render('payment-fail');
});

// Get user account 
router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decode.email });
    const userAddress = user.address;
    let cartLength = user.cart.length;

    const userOrderHistory = await orderModel.find({ user: user._id }).populate("products.product");

    console.log(userAddress);
    res.render('user-account-page', { cartLength, user, userOrderHistory, userAddress });
  } catch (err) {
    console.log(err);
    res.render('error', { message: err });
  }
});

// Paymet with upi
router.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // convert to paise
    currency: "INR",
    receipt: "receipt_123" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    return res.json(order); // send order_id to frontend
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Verify payment
router.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Create string to sign
  const signString = razorpay_order_id + "|" + razorpay_payment_id;

  // Create signature using secret key
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(signString)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({
      success: true,
      payment_stauts: "success",
      page: '/orderconfirm'
    })
  } else {
    return res.json({
      success: false,
      payment_stauts: 'fail',
    })
  }
});

// check pincode
router.post('/checkpin', (req, res)=>{
  try{
    let result = pincodes.lookup("802301");
    return res.json({
      result: result
    });
  }catch(err){
    console.log(err);
  }
});;

// Delete existence user address route
router.post('/deleteAdd', async (req, res)=>{
  try{
    const {addressId} = req.body;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({email: decode.email});
    let del = false;
    for(let i = 0; i < user.address.length; i++){
      if((user.address[i]._id).toString() === addressId){
        user.address.splice(i, 1);
        await user.save();
        del = true;
        break;
      }
    }
    if(del){
      return res.json({
        success: true,
        message: "Address deleted succesfully"
      })
    }else{
      return res.render("error", {message: "Something went wrong..."});
    }
  }catch(err){
    console.log(err);
    return res.render("error", {message: "Something went wrong\nType Error: "+err});
  };
})

//----------- Admin routes ---------------------


// Get admin dashboard
router.get('/admin', isLoggedInForAdmin, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await userModel
      .findOne({ email: decode.email })
      .populate({
        path: "adminOrder",
        populate: [
          {
            path: "user", // order ka user
          },
          {
            path: "products",
            populate: {
              path: "product", // order ke andar product
              model: "Product"
            }
          }
        ]
      });

    const adminOrder = admin.adminOrder;

    let totalRev = 0;
    let pendingOrders = 0;
    for (let val of adminOrder) {
      totalRev += val.products[0].product.sellingPrice;
      if (val.orderStatus === "Pending") {
        pendingOrders++;
      };
    };


    res.render('admin-dashboard', { admin, adminOrder, totalRev, pendingOrders });
  } catch (err) {
    console.log(err);
    res.render('error', { message: err });
  }
})
router.get("/admin/addNewProduct", isLoggedInForAdmin, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await userModel.findOne({ email: decode.email });
  res.render("admin-add-new-product", { admin });
});

// upload product by admin
router.post(
  "/upload-product",
  upload.array("images[]", 10),
  async (req, res) => {
    try {
      let cloudinaryResponse = [];
      let formData = req.body;

      const token = req.cookies.token;
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await userModel.findOne({ email: decode.email });

      // console.log(formData);
      // conseol.log(req.files);

      for (const file of req.files) {
        const cloudResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "URBANMANX" }, (error, result) => {
              if (error) {
                console.error("Cloudinary Error:", error);
                reject(error);
              } else {
                resolve(result); // 🔥 FULL RESPONSE
              }
            })
            .end(file.buffer);
        });

        cloudinaryResponse.push(cloudResult); // 🔥 Save Full object
      }

      // console.log(cloudinaryResponse);
      let imagesDetail = [];
      for (let val of cloudinaryResponse) {
        let obj = {
          secure_url: val.secure_url,
          public_id: val.public_id,
          format: val.format,
          width: val.width,
          height: val.height,
        };
        imagesDetail.push(obj);
      }

      const addedProduct = await productModel.create({
        productName: formData.ProductName,
        shortDescription: formData.ProductShortDesc,
        longDescription: formData.productLongDesc,
        category: formData.category,
        originalPrice: formData.originalPrice,
        sellingPrice: formData.sellingPrice,
        stockQuantity: formData.stockQuantity,
        stockStatus: formData.stockStatus,
        sizes: JSON.parse(formData.size),
        colors: JSON.parse(formData.colors),
        images: imagesDetail,
        fabric: formData.fabric,
        fitType: formData.fitType,
        sellerId: admin._id,
      });
      // console.log(addedProduct);
      if (addedProduct) {
        return res.json({
          success: true,
          message: "Uploaded Successfully",
          images: cloudinaryResponse,
          addedProduct: addedProduct,
        });
      } else {
        return res.json({
          success: false,
          error: "Uploaded failed!",
        });
      }
    } catch (err) {
      console.log("Upload failed:", err);
      return res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);

//Update Order Status By Admin
router.post("/updatestatus", async (req, res) => {
  try {
    const { status, orderID } = req.body;

    const order = await orderModel.findById(orderID);
    order.orderStatus = status;
    await order.save();

    return res.json({
      success: true
    });

  } catch (err) {
    console.log(err);
    res.render('error', { message: err });
  }
})



// -------------- Athentication and Authorization ----------------------
// Get sign-up page
router.get("/signup", function (req, res) {
  res.render("signup", { message: null });
});

// Get login- page
router.get("/login", (req, res) => {
  res.render("login", { message: null });
});

// Register user
// Register user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return res.render("signup", { message: "User already exist." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await userModel.create({
      userName: name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Create token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie securely
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });
    if (user.role === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong: " + err.message);
  }
});

// login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.render("login", { message: "User does not exist." });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.render("login", { message: "Email or Password is wrong." });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    if (user.role === "user") {
      return res.redirect("/");
    } else if (user.role === "admin") {
      return res.redirect("/admin");
    }
  } catch (err) {
    console.log(err);
    return res.render("login", { message: "Something went wrong" });
  }
});

// Logout the user
router.get("/logout", (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
});

// check is user is logged in or not
async function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user; // store user info for routes

    next(); // <- ONLY call next(), never redirect here
  } catch (err) {
    console.log(err);
    return res.redirect("/login");
  }
};

async function isLoggedInForAdmin(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.redirect('/login');
    };
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await userModel.findOne({ email: decode.email });
    if (!admin) {
      res.redirect('/login');
    };
    if (admin.role === "admin") {
      next();
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.log(err);
    res.render('error', { message: err });
  }
};

// Forgot password route


// Send Mail.
const sendMail = (to, sub, text) => {
  transporter
  .sendMail({
    from: process.env.EMAIL_USER,
    to: to,
    subject: sub,
    text: text
  })
  .then((info) => {
    console.log("Message sent:", info.messageId);

  })
  .catch((err) => {
    console.error("Mail error:", err);
  });

};

module.exports = router;
