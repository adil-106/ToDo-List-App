const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB");

// let items = [];
// let workItems = [];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
    name: String
});

const workItemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item",itemsSchema);
const Work = mongoose.model("Work",workItemsSchema);

const item1 = new Item({
    name: "Buy Food"
})
const item2 = new Item({
    name: "Cook Food"
})
const item3 = new Item({
    name:"Eat Food"
})

const defaultItems = [item1, item2, item3];



app.get("/", function(req,res){
    let currentDate = date.getDate();

    Item.find({},"name").then(function(foundItems){

        if (foundItems.length === 0){
            Item.insertMany(defaultItems);
            res.redirect("/")
        }
        else {
            res.render("list",{
                listTitle: currentDate,
                item: foundItems
            });
        }
        
    });
});


app.post("/", function(req,res){
    let itemName = req.body.newItem;

    if (req.body.button === "Work Items"){
        const newItem = new Work({
            name: itemName
        });

        newItem.save();
        res.redirect("/work");

    } else {
        const newItem = new Item({
            name: itemName
        });
    
        newItem.save();
        res.redirect("/")
    }
    

    // if (req.body.button === "Work Items") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }
});


app.get("/work", function(req,res){

    Work.find({},"name").then(function(foundWorkItems){
        res.render("list",{
            listTitle: "Work Items",
            item: foundWorkItems
        });
    });
    
});


app.get("/about", function(req,res){
    res.render("about");
})


app.listen(3000, function(){
    console.log("Server is up and running at port 3000");
})