import { Response } from "express";

// const sendToken = (user: any, statusCode: number, res: Response): string => {
//   const token: string = user.getJwtToken();

//   res.cookie("token", token, {
//     httpOnly: true, // more secure
//     maxAge: 1 * 24 * 60 * 60 * 1000, // 15 days
//     // sameSite: "strict", // CSRF
//     // sameSite: "lax", // allow cross-site POST
//     // secure: false, // allow cookies over HTTP
//   });

//   return token;
// };

const sendToken = (user: any, statusCode: number, res: Response): string => {
  const token: string = user.getJwtToken();

  // // You can send it in the response body (recommended for APIs)
  // res.status(statusCode).json({
  //   success: true,
  //   token, // Client will store this as Bearer token
  //   user,  // optionally return user data
  // });
  return token;
};

export default sendToken;
