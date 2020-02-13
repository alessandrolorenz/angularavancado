const mongoose = require('mongoose');
const Faker = require('faker');
const Product = require('./product');

mongoose.connect('mongodb://localhost:27017/http_client', {useNewUrlParser: true});

async function generateProduct() {
  
  for(let i =0; i<10; i++) {
    let p = new Product({
      name: Faker.commerce.productName(),
      department: Faker.commerce.department(),
      price: Faker.commerce.price()
    })
    try{
      await p.save()
    } catch(err){
      throw new Error("Error generating products")
    }
  }

}

generateProduct().then(()=>{
  mongoose.disconnect();
  console.log('Desconectado!')
})