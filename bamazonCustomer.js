require('dotenv').config()
const mysql = require('mysql')
const inquirer = require('inquirer')

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'bamazon'
})

connection.connect(function( err ) {
  if ( err ) throw err
  console.log(`connected as id ${ connection.threadId }`)
  customerOrder()
})

const customerOrder = () => {
  connection.query('SELECT * FROM products', function( err, res ) {
    if ( err ) throw err
    let line = `-----------------------------------------------`
    for ( let i in res ) {
      let id = res[i].item_id.toString().padEnd(3, ' ')
      let itemName = res[i].product_name.padEnd(25, ' ')
      let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
      console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }\n${ line.padEnd(56, '-') }`)
    }  
    inquirer
      .prompt([
        {
          name: 'itemChoice',
          type: 'input',
          message: 'Please enter the ID of the item you wish to purchase?'
        },
        {
          name: 'quantity',
          type: 'input',
          message: 'Please enter the amount you would like?'
        }
      ])
      .then(function(answer) {
        let chosenItem
        for ( let i in res ) {
          if ( res[i].item_id === parseInt(answer.itemChoice) ) {
            chosenItem = res[i]
          }
        }

        if ( chosenItem.stock_quantity >= answer.quantity ) {
          let newStockQuantity = chosenItem.stock_quantity - answer.quantity
          let totalPrice = (answer.quantity * chosenItem.price).toFixed(2)
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              { stock_quantity: newStockQuantity },
              { item_id: chosenItem.item_id }
            ],
            function(err, res ) {
              if ( err ) throw err
              console.log(`\nYou successfully purchased ${ answer.quantity } ${ chosenItem.product_name } for a total of $${ totalPrice }\n`)
              inquirer
                .prompt(
                  {
                    name: 'restart',
                    type: 'list',
                    message: 'Do you want to make another purchase?',
                    choices: ['Yes', 'No']
                  }
                )
                .then(function(res){
                  if (res.restart == 'Yes') {
                    customerOrder()
                  } else {
                    console.log(`Thank you, have a nice day!`)
                    connection.end()
                  }
                })
            }
          )
        } else {
          console.log(`Insufficient quantity!`)
          inquirer
            .prompt(
              {
                name: 'restart',
                type: 'list',
                message: 'Would you like to purchase something else?',
                choices: ['Yes', 'No']
              }
            )
            .then(function(res){
              if (res.restart == 'Yes') {
                customerOrder()
              } else {
                console.log(`\nThank you, have a nice day!\n`)
                connection.end()
              }
            })
        }
      })
  })
}