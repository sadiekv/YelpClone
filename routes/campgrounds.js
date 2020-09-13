var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn,function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
	var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
    var newCampground = {name: name, price:price, image: image, description: desc, author: author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
			req.flash("success", "Campground added");
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req,res){
	    //to find the campground
	Campground.findById(req.params.id, function(err, foundCampground){
	res.render("campgrounds/edit", {campground:foundCampground});
	});
});

///DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}else{
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		}
	});
});


//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership,function(req,res){
	//find and update correct campground
  Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err,updatedCampground){
		if (err){
			res.redirect("/campgrounds");	
		}else{
			//redirect somewhere(show page) and see updates
			req.flash("success", "Successfully updated campground");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
 
function checkCampgroundOwnership(req,res,next){
		if(req.isAuthenticated()){
	    //to find the campground
			Campground.findById(req.params.id, function(err, foundCampground){
		    if(err){ //does the campground exist
			   res.redirect("back");
		    }else{     
				//does user own campground
				if(foundCampground.author.id.equals(req.user._id)){
				                         //pass in the campground to be editted
					next();	
				}else{
					res.redirect("back");
				}   
		}
	});
	}else{
		res.redirect("back");
		////back to previous page
	}
}

module.exports = router;