const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/toDoListAppDB");

// let items = [];
// let workItems = [];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    }
});


const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Buy Food"
});

const item2 = new Item({
    name: "Cook Food"
});

const item3 = new Item({
    name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
}); 

const List = mongoose.model("List",listSchema);




app.get("/", function(req,res){
    let currentDate = date.getDate();

    Item.find().then(function(foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems).then(function(result){
                console.log("Default Items inserted successfully");
                console.log(result);
                res.redirect("/");
            })
            .catch(function(err){
                console.log("There was an error inserting the default items: ",err);
            });
        }
        else{
            console.log("Successfully retrieved items for home route: ",foundItems);
            res.render("list",{
                listTitle: currentDate,
                item: foundItems
            })
        }
    })
    .catch(function(err){
        console.log("There was an error retrieving items for home route: ", err);
    });
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundItem){
        if(foundItem){
            console.log(foundItem);
            res.render("list", {
                listTitle: customListName,
                item: foundItem.items});
        }
        else{
            console.log("List not found. Creating this list...");
            const customListItem = new List({
                name: customListName,
                items: defaultItems
            });
            customListItem.save();
            res.redirect("/" + customListName);
        }
    })
    .catch(function(err){
        console.log("Error finding an item: ", err);
        
    });
});


app.post("/", function(req,res){
    let currentDate = date.getDate();
    let itemName = req.body.newItem;

    const listName = req.body.button;

    if(listName === currentDate){
        const newItem = new Item({
            name: itemName
        });
        newItem.save();
        res.redirect("/");
    }
    else {
        List.findOne({name:listName}).then(function(foundList){
            if(foundList){
                const newItem = new Item({
                    name: itemName
                });
                foundList.items.push(newItem);
                foundList.save();
                console.log(foundList);
                res.redirect("/"+listName);
            }
        })
        .catch(function(err){
            console.log("There was an error adding items to "+ listName + " ", err);
        });
    }
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.hiddenInput;
    const currentDate = date.getDate();
    console.log(listName);

    if(listName === currentDate){
        Item.findByIdAndRemove(checkedItemId)
        .then(function(removedId){
            if(removedId){
                console.log("Removed User: ", removedId);
                res.redirect("/");
            }
            else{
                console.log("Id not found");
            }
        })
        .catch(function(err){
            console.log("Error removing the item: ", err);
        });
    }
    else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},{new:true})
        .then(function(updatedItem){
            if(updatedItem){
                console.log("Updated Item:",updatedItem);
                res.redirect("/"+listName);
            }
            else {
                console.log("Item not found")
            }
        })
        .catch(function(err){
            console.log("Error in updating the item:",err);
        })
    }
    
});




app.get("/about", function(req,res){
    res.render("about");
})


app.listen(3000, function(){
    console.log("Server is up and running at port 3000");
})