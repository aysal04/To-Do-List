//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://lasya04:x2ZsdqEvJQj82CF@cluster0.tnqlybm.mongodb.net/todolistDB", {useNewUrlParser:true});
const itemsSchema={
  name:String
};

const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome"
});
const item2 = new Item({
  name:"Thank you"
});
const defaultItems = [item1, item2];

const ListsSchema={
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",ListsSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    // if(foundItems.length ==  0){
    //   Item.insertMany(defaultItems,function(err){
    //     if(err){
    //       console.log(err);
    //     }
    //   });
    //   res.redirect("/");
    // }
    // else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    // }
  });



});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if(listName == "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err,x){
      x.items.push(item);
      x.save();
      res.redirect("/"+listName);
    })
  }


});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkedItemId}}},function(err,x){
      if(err){
        console.log(err);
      }
      else{
        x.save();
        res.redirect("/"+listName);
      }
    })
  }


});

app.get("/:topic", function(req,res){
     const topic = req.params.topic;
     const url = _.capitalize([string=topic])
     List.findOne({name:url},function(err,x){
     if(!err){
          if(x){
           res.render("list", {listTitle: url, newListItems: x.items});
         }
         else{
           const list = new List({
             name:url,
             items:defaultItems
           });
           list.save();
           res.redirect("/"+ url);
         }
      }
      else{
        console.log(err);
      }
     });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
