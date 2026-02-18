// src/types/express.d.ts
 // Adjust path to your User interface
 import { IUser } from "@/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // or 'any' if you haven't defined a user interface yet
    }
  }
}

export {}; // Ensure this is treated as a module
