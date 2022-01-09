const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
const io = require("socket.io")(server);

require("dotenv").config();

let i = 0;
let START_TIME = null;
let END_TIME = null;
let DURATION = null;

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const bcrypt = require("bcrypt");

const flash = require("connect-flash");

const session = require("express-session");

//connect to mongo DB
const connectDB = require("./db/connect");

//Passport
const passport = require("passport");

//Passport config
require("./config/passport")(passport);

//User collection
const User = require("./collections/User");
const Meeting = require("./collections/Meeting");
const bodyParser = require("body-parser");

app.use("/peerjs", peerServer);
app.use(express.static("public"));
app.use(express.json());

//to get the requests body
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
//Passport
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//functions
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + "hrs " + minutes + "mins " + seconds + "secs";
}

app.get("/", (req, res) => {
  res.render("HomePage", { homeId: req.params.HomePage });
});

app.get("/sign-in", checkNotAuthticated, (req, res) => {
  res.render("Sign-in", { signInId: req.params["Sign-in"] });
});

app.get("/sign-up", (req, res) => {
  res.render("Sign-up", { signUpId: req.params["Sign-up "] });
});

//assiduite
const NEWMEETING = `/meeeteor_${Math.random().toString(36).substr(2, 10)}`;
/*
app.get("/all-users", checkNotAuthticated, async (req, res) => {
  const MongoClient = require("mongodb").MongoClient;

  const client = await new MongoClient(
    process.env.MONGO_CONNECTION_URL
  ).connect();
  const Meeeteor = client.db("Meeeteor");
  const Users = Meeeteor.collection("users");
  const today = new Date().toLocaleDateString().toString();
  await Users.find(
    { meetings: { $in: [NEWMEETING] } },
    {
      projection: {
        _id: 0,
        name: 1,
        email: 1,
        date: 1,
      },
    }
  )
    .toArray()
    .then((results) => res.render("allUsers", { results }));
});
*/

app.get("/all-users", checkNotAuthticated, async (req, res) => {
  END_TIME = new Date().toLocaleTimeString();

  console.log("users array : ", attendees_users);
  res.render("allUsers", {
    results: attendees_users,
    start_time: START_TIME,
    end_time: END_TIME,
    duration: msToTime(new Date().getTime() - DURATION),
  });
  console.log(" duration : ", msToTime(new Date().getTime() - DURATION));
});

//---------- SIGN UP functionality ----------

//Add the new User to MongoDB
app.post("/sign-up", function (req, res) {
  const { name, email, password, password2, isTeacher } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check passwords match
  if (password != password2) errors.push({ msg: "Passwords do not match" });

  //check password legth
  if (password.length < 6)
    errors.push({ mdg: "Password should be at least 6 caracteres" });

  if (errors.length > 0) {
    res.render("Sign-up", {
      signUpId: req.params["Sign-up "],
      errors,
      name,
      email,
      password,
      password2,
      isTeacher,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      //user already exists
      if (user) {
        errors.push({ msg: "user already exists" });
        res.render("Sign-up", {
          signUpId: req.params["Sign-up "],
          errors,
          name,
          email,
          password,
          password2,
          isTeacher,
        });
      } else {
        const newUser = new User({ name, email, password, isTeacher });

        console.log("new user : ", newUser);

        console.log("teacher type : ", typeof newUser.isTeacher);
        //Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw Error();

            //set the new password
            newUser.password = hash;

            //Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/sign-in");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

//Protect deferent routes from unauthenticated users
function checkAuthticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/sign-in");
}

function checkNotAuthticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/sign-in");
  next();
}

//---------- SIGN IN functionality ----------

//check if user exists in MongoDB
app.post("/sign-in", (req, res, next) => {
  //Update the date of the loged in user
  var MongoClient = require("mongodb").MongoClient;
  MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, db) {
    if (err) throw err;
    var dbo = db.db("Meeeteor");

    //The loged in user
    var userQuery = { email: req.body.email };
    var userNewvalues = {
      $push: { meetings: NEWMEETING },
    };

    //The new meeting
    dbo
      .collection("users")
      .updateOne(userQuery, userNewvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });

    const newMeeting = new Meeting({ name: NEWMEETING });
    newMeeting
      .save()
      .then((user) => {
        req.flash("success_msg", "You are now registered and can log in");
      })
      .catch((err) => console.log(err));
  });

  passport.authenticate("local", {
    successRedirect: NEWMEETING,
    failureRedirect: "/sign-in",
    failureFlash: true, //display the messages that we provided before
  })(req, res, next);
});

//To clear and logout the session (use it with the quit button in room)
app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/all-users");
});

app.post("/:id", checkAuthticated, (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.get("/:id", checkAuthticated, (req, res) => {
  DURATION = new Date().getTime();
  START_TIME = new Date().toLocaleTimeString();

  console.log("ROOM_ID : ", req.params.id);
  res.render("room", { roomId: req.params.room });
});

let attendees_users = [];
const users = {};

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.emit("user-connected", userId);
    console.log("Users 1 : ", users);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", {
        message: message,
        name: users[socket.id],
      });
      socket.on("disconnect", function (userId) {
        socket.broadcast.emit("user-disconnected", users[socket.id]);
        attendees_users.map((user) => {
          if (user.id == socket.id) {
            user.quit_time = new Date().toLocaleTimeString();
            user.duration = msToTime(
              Number(new Date().getTime()) - user.duration
            );
          }
        });

        delete users[socket.id];
      });
    });
  });

  socket.on("new-user", (user) => {
    attendees_users.push({
      id: socket.id,
      user: user,
      time: new Date().toLocaleTimeString(),
      quit_time: null,
      duration: Number(new Date().getTime()),
    });
    users[socket.id] = user;
    i += 1;
  });
});

const PORT = process.env.PORT || 3030;
const startApp = async () => {
  try {
    await connectDB(process.env.MONGO_CONNECTION_URL);
    server.listen(PORT, console.log(`server is running on port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

startApp();
