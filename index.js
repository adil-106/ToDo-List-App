const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let items = [];
let workItems = [];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/", function(req,res){
    let today = new Date();
    let options = {
        weekday: "long",
        month: "long",
        year: "numeric",
        day: "numeric"
    }
    let currentDate = today.toLocaleDateString("en-US",options);
    res.render("list",{
        listTitle: currentDate,
        item: items
    })
});


app.post("/", function(req,res){
    let item = req.body.newItem;
    if (req.body.button === "Work Items") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});


app.get("/work", function(req,res){
    res.render("list",{
        listTitle: "Work Items",
        item: workItems
    });
});

app.get("/about", function(req,res){
    res.render("about");
})


app.listen(3000, function(){
    console.log("Server is up and running at port 3000");
})