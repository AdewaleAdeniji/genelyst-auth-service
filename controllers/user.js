const UserService = require("../services/user");
const {
  validateRequest,
  isValidEmail,
  generateID,
  createHash,
  validateHash,
  signToken,
} = require("../utils/index");

exports.createUser = async (req, res) => {
  try {
    /// here
    const body = req?.body;
    const val = validateRequest(body, [
      "firstName",
      "lastName",
      "email",
      "password",
    ]);
    if (val)
      return res.status(400).send({
        message: val,
      });

    // has all parameters
    // if email is already registered // valid

    const checkEmail = isValidEmail(body.email);
    if (!checkEmail)
      return res.status(400).send({ message: "Invalid email address" });

    const hasRegistered = await UserService.getUserByEmail(body.email);

    if (hasRegistered)
      return res.status(400).send({ message: "Email already registered" });

    // create user
    body.userID = generateID();
    body.password = await createHash(body.password);
    const createUser = await UserService.createUser(body);
    if (!createUser)
      return res.status(400).send({ message: "User account creation failed " });
    createUser.message = "Registration successful";
    return res.status(200).send(createUser);
  } catch (err) {
    console.log(err);
    return res.send(500);
  }
};
exports.loginUser = async (req, res) => {
  try {
    const body = req.body;
    const val = validateRequest(body, ["email","password"]);
    if(val) return res.status(400).send({ message: val });

    //all good
    const checkEmail = isValidEmail(body.email);
    if (!checkEmail)
      return res.status(400).send({ message: "Invalid email address" });
    
    // fetch the user
    // compare the password 
    const user = await UserService.getUserByEmail(body.email);

    if (!user)
      return res.status(400).send({ message: "Incorrect email or password" });
    
    const hashedPassword = user.password;
    const plainPassword = body.password;

    const isValidPassword = validateHash(hashedPassword, plainPassword);

    if(!isValidPassword) return res.status(400).send({ message: "Incorrect email or password" });

    //here, all is good
    // generate token

    const response = {
      firstName: user.firstName,
      lastName: user.lastName,
      userID: user.userID,
      message: 'login successful'
    }
    const token = await signToken(response);
    response.token = token;
    return res.status(200).send(response)

  } catch (err) {
    console.log(err);
    return res.send(500);
  }
};
