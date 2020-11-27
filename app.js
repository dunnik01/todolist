//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//Connection to mongoose db
mongoose.connect("mongodb+srv://admin_divya:Test@123@cluster0.wsbrm.mongodb.net/ToDoListDB?retryWrites=true&w=majority",{
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
useCreateIndex: true
 });
 //Schema for each item
 const itemSchema=new mongoose.Schema({
   name :String
});
//Model for each item
const Item=mongoose.model("item",itemSchema);
// Adding default items
const item1=new Item({
  name: "Welcome to do list"
});
const item2=new Item({
  name: "Hit the + button to add a new item"
});
const item3=new Item({
  name: "<-- Hit the delete button to delete an item"
});
const defaultItems=[item1,item2,item3];
//Schema for List with item as one field
const listSchema=new mongoose.Schema({
  name:String,
  item :[itemSchema]

});
//Model for list
const List=mongoose.model("list",listSchema);
//Home page routing
app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(err){
      console.log("There is an error"+err);
    }else{
      console.log("Results are fetched" );
      //If already the list is empty, default items are added to the db
      if(results.length===0){
        Item.insertMany(defaultItems)
        .then(function(){
            console.log("Data inserted") ;
        }).catch(function(error){
            console.log(error);

        });
        res.redirect("/");
        //else displaying the List already saved with list name as today
      }else{
        res.render("list", {listTitle: "Today", newListItems: results});
      }
    }

  });
//const day = date.getDate();
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;//New item
  const listName=req.body.list; //List name

  const itemNew = new Item({
    name: itemName
  });

  //If homepage/today list then save directly
  if(listName === "Today"){
    itemNew.save();
    res.redirect("/");
  }else{
    //otherwise find the list name and  push in that list and redirect to that page
    List.findOne({name:listName}, function(err,foundList){
      foundList.item.push(itemNew);
      foundList.save();
      res.redirect("/" +listName);
    });
    }
  });


/*  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }*/

//To delete an item
app.post("/delete",function(req,res){
  var listName=req.body.listName;
var deleteItem=req.body.checkbox;
console.log("listName"+listName);
if (listName === "Today"){
Item.findByIdAndRemove(deleteItem,function(err){
if(err){
  console.log("Some error has occured"+err);
}  else{
console.log("Item is deleted "+deleteItem);
}
});
res.redirect("/" );
}else{
  List.findOneAndUpdate({name:listName},{$pull:{item:{_id:deleteItem}}},function(err,foundList){
    if(!err){
      res.redirect("/" +listName);
    }
  });
}
});

//If user accessing a custom list
app.get("/:customListName" ,function(req,res){
  const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
  if(!err){
    //if the list is not existing add a new list
  if(!foundList){
  //Create new list
  const list=new List({
    name :customListName,
    item :defaultItems
  });
  list.save();
  res.redirect("/"+ customListName);
  }else{
    //redirecting to existing list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.item})
  }
  }
});


});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port==null || port == ""){
  port =3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
