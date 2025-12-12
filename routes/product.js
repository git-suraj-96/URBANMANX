const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    longDescription: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    stockStatus: {
      type: String,
    },

    sizes:  Array,

    colors: {
      type: Array
    },

    images: [
      {
        secure_url: { type: String, required: true },
        public_id: {type: String, required: true},
        format: {type: String, required: true},
        width: {type: Number},
        height: {type: Number}
      },
    ],

    fabric: {
      type: String,
    },

    fitType: {
      type: String,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =  mongoose.model("Product", productSchema);
