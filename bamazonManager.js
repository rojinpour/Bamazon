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
  managerStart()
})

const managerStart = () => {
  inquirer
    .prompt(
      {
        name: 'command',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View Sale List',
          'View Inventory List',
          'Add to Inventory',
          'Add New Product',
          'Exit '
        ]
      }
    )
    .then(function(res) {
      switch ( res.command ) {
        case 'View Sale List':
          listProducts()
          break
        case 'View Inventory':
          lowInventory()
          break
        case 'Add to Inventory':
          addInventory()
          break
        case 'Add New Product':
          addProduct()
          break
        case 'Exit':
          connection.end()
          break
        default: 
   
          console.log(`Error, please try again`)
          managerStart()
      }
    })
}

const listProducts = () => {
  connection.query(
    'SELECT * FROM  products',
    function( err, res ) {
      printData(err, res)
      managerStart()
    }
  )
}

const lowInventory = () => {
  connection.query(
    'SELECT * FROM products WHERE stock_quantity < 5', 
    function( err, res ) {
      printData(err, res)
      managerStart()
    }
  )
}

const addInventory = () => {
  connection.query(
    'SELECT * FROM products',
    function(err, res) {
      inquirer
        .prompt([
          {
            name: 'command', 
            type: 'list',
            message: 'Enter quantity',
            choices: function() {
              let arr = []
              for ( let i = 0; i < res.length; i++ ){
                arr.push(res[i].product_name)
              }
              return arr
            }
          },
          {
            name: 'quantity',
            type: 'input',
            message: 'How much?'
          }
        ])
        .then(function(item) {
          let itemToUpdate;
          for ( let i = 0; i < res.length; i++ ) {
            if ( res[i].product_name === item.command ) {
              itemToUpdate = res[i]
            }
          }

          let newQuantity = parseInt(itemToUpdate.stock_quantity) + parseInt(item.quantity)

          connection.query(
            'UPDATE products SET ? WHERE ?',
            [
              {
                stock_quantity: newQuantity
              },
              {
                item_id: itemToUpdate.item_id
              }
            ], function( err ) {
              if ( err ) throw err
              console.log(`\n${ itemToUpdate.product_name } updated. New quantity is ${ newQuantity }\n`)
              managerStart()
            }
          )
        })
    }
  ) 
}

const addProduct = () => {
  inquirer
    .prompt([
      {
        name: 'item',
        type: 'input',
        message: 'What product would you like to add to inventory?',
      },
      {
        name: 'department',
        type: 'input',
        message: 'What department?'
      },
      {
        name: 'price',
        type: 'input',
        message: 'What is the list price?'
      },
      {
        name: 'quantity',
        type: 'input',
        message: 'How many do you want to add to stock?'
      }
    ])
    .then(function(answers) {
      connection.query(
        'INSERT INTO products SET ?',
        {
          product_name: answers.item,
          department_name: answers.department,
          price: answers.price,
          stock_quantity: answers.quantity
        },
        function(err, res) {
          if (err) throw err
          console.log(`\n${answers.quantity} ${answers.item} were added to inventory\n`)
          managerStart()
        }
      )
    })
}

const printData = (err, res) => {
  if ( err ) throw err
  let line = `-----------------------------------------------`
  console.log(``)
  for ( let i in res ) {
    let id = res[i].item_id.toString().padEnd(3, ' ')
    let itemName = res[i].product_name.padEnd(25, ' ')
    let price = res[i].price.toFixed(2).toString().padStart(8, ' ')
    let quantity = res[i].stock_quantity.toString().padStart(6, ' ')
    console.log(`ID: ${ id } Item: ${ itemName } Price: $${ price }  On Hand: ${ quantity }\n${ line.padEnd(73, '-') }`)
  } 
  console.log(``)
}