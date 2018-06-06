var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - route
router.get("/", function(req, res){
    //get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds})
        }
    });
});

//NEW - route
router.get("/new", middleware.isLogggedIn, function(req, res) {
   res.render("campgrounds/new") ;
});

//CREATE - route
router.post("/", middleware.isLogggedIn, function(req, res){
   //get data from from and add to capmgrounds array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, price: price, image: image, description: desc, author: author};
   //create new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       }else{
           //redirect back to campgrounds page
           res.redirect("/campgrounds");
       }
   })
});

//SHOW - route
router.get("/:id", function(req,res){
    //find campground with :id
    var id = req.params.id;
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err|| !foundCampground){
            req.flash("error", err.message);
            console.log(err);
            res.redirect("back");
        }else{
            //show campground
            res.render("campgrounds/show", {campground: foundCampground});        
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UDPATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   //find and update campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campground");
       }else{
           res.redirect("/campgrounds/" + req.params.id);
       }
   })
});


//DESTROY ROUTE
router.delete("/:id/", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       }else{
           res.redirect("/campgrounds");
       }
   });
});




module.exports = router;