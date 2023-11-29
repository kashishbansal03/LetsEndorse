const exp = require("express");
const app = exp();
const path = require("path");
var cors = require('cors')
app.use(cors())

app.use(exp.static(path.join(__dirname, "./build")));

app.listen(3500, () => {
  console.log("http server listening on port no 3500");
});
const mclient = require("mongodb").MongoClient;

mclient
  .connect("mongodb://127.0.0.1")
  .then((dbRef) => {
    const dbobj = dbRef.db("database2");
    const farmerscollectionobj = dbobj.collection("farmerscollection");
    app.set("farmerscollectionobj", farmerscollectionobj);
    console.log("DBconnection is successful");
  })
  .catch((err) => console.log("DBerror is", err));

// let users=[]

const farmerapp = require("./API/farmerapi");
app.use("/farmer-api", farmerapp);

app.use(exp.json());

const invalidpathmiddleware = (req, res, next) => {
  res.send({ message: "invalid path" });
};
app.use("*", invalidpathmiddleware);

const errormiddleware = (error, req, res, next) => {
  res.send({ message: error.message });
};
app.use(errormiddleware);
