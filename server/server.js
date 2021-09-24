const express=require('express') 
const app = express()
const cors =require('cors')

// Added for login function 
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const User=require('./models/user.js')
const auth=require('./middleware/auth')
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
const DB_URL = 'mongodb://localhost/users';
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log('DB connected...'))
mongoose.set('useFindAndModify', false);




app.use(cors())


app.get('/',(req,res)=>{
    res.send('Welcome to Test API')
})

app.get('/api/investment',auth,(req,res)=>{
    const investment=[{
        investmentId:123456,
        memberId:321654,
        amount:100000,
        type:"bank-deposit",
        depositDate:"July 19, 2021",
        image:"https://i.imgur.com/n7bTdDV.jpg",
        quarterId:235689,
        totalInvestment:300000,
        totalShares:300000
    },
    {
        investmentId:123457,
        memberId:321655,
        amount:900000,
        type:"e-transfer",
        depositDate:"July 20, 2021",
        image:"https://i.imgur.com/GO4Tv3F.jpg",
        quarterId:235690,
        totalInvestment:280000,
        totalShares:280000
    }
]
    res.json(investment)
})



// signin function
const signin=async (req,res)=>{
    const { email, password } = req.body;

    try {
      const oldUser = await User.findOne({ email });
  
      if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });
  
      const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  
      if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, 'secret', { expiresIn: "1h" });
  
      res.status(200).json({ result: oldUser, token });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
}

// signup function
const signup=async (req, res)=>{
    const { email, password, confirmPassword,firstName, lastName } = req.body;

  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    if(password!==confirmPassword)return res.status(400).json({message:"Passwords don't match."})

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({ email, password: hashedPassword, firstName,lastName,name:`${firstName} ${lastName}` });

    const token = jwt.sign( { email: result.email, id: result._id }, 'secret', { expiresIn: "1h" } );

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    
    console.log(error);
  }
}
// signin route
app.post('/user/signin',signin)
// signup route
app.post('/user/signup',signup)







const PORT= process.env.PORT || 5001

app.listen(PORT,()=>console.log(`Server running on port: ${PORT}`))


// export const createPost = async (req, res) => {
//     const post = req.body;

//     const newPostMessage = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

//     try {
//         await newPostMessage.save();

//         res.status(201).json(newPostMessage );
//     } catch (error) {
//         res.status(409).json({ message: error.message });
//     }
// }