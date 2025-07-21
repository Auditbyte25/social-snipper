import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "./catchAsyncErrors";
import jwt from "jsonwebtoken";
import User from "../model/user";

// Creating authentication middleware
// const isAuthenticated = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // Destructuring token from the cookies
//     const { token } = req.cookies;
//     console.log({ token: req.cookies });
//     if (!token) {
//       return next(new ErrorHandler("Please connect waller to continue", 401));
//     }

//     const jwt_key: any = process.env.JWT_SECRET_KEY;
//     const decoded: any = jwt.verify(token, jwt_key);

//     (req as any).user = await User.findById(decoded.id);
//     next();
//   }
// );

const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ErrorHandler("Please connect wallet to continue", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const jwt_key: any = process.env.JWT_SECRET_KEY;
      const decoded: any = jwt.verify(token, jwt_key);

      (req as any).user = await User.findById(decoded.id);

      if (!(req as any).user) {
        return next(new ErrorHandler("User not found", 404));
      }

      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired token", 401));
    }
  }
);


// Creating isAdmin middleware
const isAdmin = (...roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        new ErrorHandler(
          `${(req as any).user.role} cannot access this resource!`,
          403
        )
      );
    }
    next();
  };
};

export { isAuthenticated, isAdmin };
