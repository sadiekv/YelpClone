var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")
    
//requring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
mongoose.connect("mongodb+srv://MongoPrac:MongoPrac@cluster0.cnjdf.mongodb.net/yelp_Campv91?retryWrites=true&w=majority",{
	useNewUrlParser:true,   ///router lights
	useCreateIndex:true,
	useUnifiedTopology: true///// router lights
}).then(() => {
	console.log("You are Connected to DB");  ///if successful do this
}).catch(err => {
	console.log("Ugh, something is wrong", err.message); ///if error do this need error message to know what went wrong -err.message
});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");

});

//seye showing commit
