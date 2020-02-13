const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Product = require('./product')

let app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

mongoose.connect('mongodb://localhost:27017/http_client', 
{   useNewUrlParser: true ,
    useUnifiedTopology: true })


let myLogger = function (req, res, next) {
  console.log(req.body);
  next();
}

app.use(myLogger)

app.get('/products' , function (req, res) {
  Product.find({}).lean().exec(
    (err, prods) => {
      if (err)
        res.status(500).send(err)
      else
        res.status(200).send(prods)
    }
  )
})


app.get('/productserr' , function (req, res) {
  setTimeout(
    () => {
        res.status(500).send({msn: "An error occured"});
    }, 2000 )

  })



app.get('/productsdelay' , function (req, res) {
  setTimeout(
    () => {
      Product.find({}).lean().exec(
        (err, prods) => {
          if (err)
            res.status(500).send(err)
          else
            res.status(200).send(prods)
        }
      )    

    }, 2000 )

  })



  app.get('/products_ids' , function (req, res) {
    Product.find({}).lean().exec(
      (err, prods) => {
        if (err)
          res.status(500).send(err)
        else
          res.status(200).send(prods.map(p=>p._id))
      }
    )
  })

  app.get('/products/name/:id' , function (req, res) {
    const id = req.params.id
    Product.findById(id, (err, prod) => {
        if (err)
          res.status(500).send(err)
        else if (!prod)
          res.status(404).send({})
        else
          res.status(200).send(prod.name)
      }
    )
  })

  app.post('/products' , function (req, res) {
    let p = new Product({
      name: req.body.name,
      price: req.body.price,
      department: req.body.department,
    })
    p.save((err, prod)=>{
      if(err)
       res.status(500).send('An error ocurred' + err)
      else 
        res.status(200).send(prod)
    })
  })

  app.delete('/products/:id', function (req, res) {
    Product.deleteOne({_id:req.params.id},
      (err) =>  {
        if(err)
          res.status(500).send(err)
        else
          res.status(200).send({})
      }  
    )
  })

  app.patch('/products/:id', function(req, res) {
    Product.findById(req.params.id, (err, prod) => {
      console.log("TESTE " +req.params.id)
      if(err)
        res.status(500).send(err)
      else if (!prod)
        res.status(404).send({msn: "Not found"}) // se der ruim tirar a resposta send({})
      else {
        prod.name=req.body.name;
        prod.price=req.body.price;
        prod.department=req.body.department;
        prod.save((err, prod) => {
          if(err)
            res.status(500).send(err)
          else
            res.status(200).send(prod)
        })
      }
    })
  })


app.listen(3000)