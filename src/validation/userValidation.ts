import Joi from "@hapi/joi";

interface userData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  DOB: string;
  phoneNumber: string;
  confirm_pwd: string;
}

interface userLoginData {
    email: string;
    password: string;
}

export const userRegister = (data: userData) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().lowercase().min(6).required(),
    phoneNumber: Joi.string().length(11).required(),
    DOB: Joi.string().required(),
      password: Joi.string().min(6).required(),
    confirm_pwd: Joi.ref("password"),
  });
    

  return schema.validate(data);
};


export const userLogin = (data: userLoginData) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().min(6).required(),
        password: Joi.string().min(6).required(),
    });
    
    return schema.validate(data);
}
