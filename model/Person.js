const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   anime: {
      type: String,
      required: true,
   },
   rank: {
      type: Number,
      required: true,
   }
});

const Person = mongoose.model("Person", personSchema);
module.exports = Person;
