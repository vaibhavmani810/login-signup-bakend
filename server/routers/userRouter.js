const  express = require('express');
const User = require("../models/User");
const router = express.Router();
const  {body,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');


/*
user Router
Usage : Register a User
URL :http://127.0.0.1:5000/api/users/register
parameters : name ,email,password
methode : post
access : public
*/

router.post('/register' ,[
    body('name').notEmpty().withMessage('name is required'),
    body('email').notEmpty().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required')

] ,async (request,response) => {
    let error =validationResult(request)
    if (!error.isEmpty()){
        return response.status(401).json({error : error.array()})
    }
    try{
        let {name, email , password} = request.body;

        // check if user already exists or not
           let user = await User.findOne({email :email });
           if(user){
               return response.status(401).json({error : [{message : 'user is already Exist'}]})
           }

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
           password = await bcrypt.hash(password , salt);

        //avatar URL

        let avatar = gravatar.url(email , {
            s : '200',
            r : 'pg',
            d : 'mm'
        });
         //isAdmin

        let isAdmin = false;

        // save to db

         user = new User({name , email , password ,avatar , isAdmin });
         user = await  user.save();


         response.status(200).json({
             message : 'registration is successful'
         })


    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});

/*
user Router
Usage : Login a User
URL :http://127.0.0.1:5000/api/users/login
parameters : email,password
methode : post
access : public

*/

router.post('/login' ,  [
    body('email').notEmpty().withMessage('enter email'),
    body('password').notEmpty().withMessage('enter password')
    ],
     async (request,response) => {
         let error = validationResult(request);
         if (!error.isEmpty()){
             return response.status(401).json({error : error.array()})
         }
         try{

        let {email,password} = request.body;
        //check user is exist or not

             let user = await User.findOne({email : email})
             if (!user){
                 return response.status(401).json([{message : 'invalid credential'}])
             }

             // check the password
             let isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch){
                 return response.status(401).json([{message : 'invalid credential'}])
             }
             response.status(200).json({
                message : 'login is successful'
             })
             
    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});






module.exports = router



