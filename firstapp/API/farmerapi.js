const exp = require("express");
const farmerapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")


farmerapp.use(exp.json())

farmerapp.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const farmerscollectionobj = req.app.get("farmerscollectionobj");
    const newuser = req.body;

    const isexisted=await farmerscollectionobj.findOne({name:newuser.name})
    if(isexisted!=null){
        res.status(200).send({message:"username already exists.Please rename"})
    }
    else{
        if(newuser.password!=newuser.repeatpassword){
            res.status(200).send({message:"password and repeated password did not match . Please retry "})
        }
        else{
            const hashedpassword=await bcryptjs.hash(newuser.password,10)
            newuser.password=hashedpassword
            delete newuser.repeatpassword
            await farmerscollectionobj.insertOne(newuser)
            res.status(201).send({message:"User registered"})
        }
    }
  })
);

farmerapp.post("/login",expressAsyncHandler(async(req,res)=>{
    
    const farmerscollectionobj=req.app.get("farmerscollectionobj")
    const user=req.body

    const existeduser=await farmerscollectionobj.findOne({name:user.username})
    if(existeduser==null){
        res.status(200).send({message:"Invalid username . Register to Login"})
    }
    else{
        const isequal=await bcryptjs.compare(user.password,existeduser.password)
        if(isequal==false){
            res.status(200).send({message:"Password is incorrect.Please try again"})
        }
        else{
        const jwtToken=jwt.sign({username:user.username},'abcdef',{expiresIn:'1d'})
        res.status(201).send({message:"login successful",token:jwtToken,user:user.username})
        }
    }


}))


farmerapp.get('/get-users',expressAsyncHandler(async(req,res)=>{
    const farmerscollectionobj=req.app.get("farmerscollectionobj")
    const users=await farmerscollectionobj.find().toArray()
    res.send({message:"users list",payload:users})
}))


farmerapp.put('/update-user',expressAsyncHandler(async(req,res)=>{
    const farmerscollectionobj=req.app.get("farmerscollectionobj")
    const modifieduser=req.body
    await farmerscollectionobj.updateOne({id:modifieduser.id},{$set:{...modifieduser}})
    const allusers=await farmerscollectionobj.find().toArray()
    res.send({message:"modified",payload:allusers})
}))

farmerapp.delete('/delete-user/:id',expressAsyncHandler((req,res)=>{
    const userid=+(req.params.id)
    const farmerscollectionobj=req.app.get("farmerscollectionobj")
    farmerscollectionobj.deleteMany({id:userid})
    res.send({message:"deleted"})
}))

module.exports = farmerapp;
