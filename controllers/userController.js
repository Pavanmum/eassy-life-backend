import { asyncHandler } from "../middleware/asyncHandler.js";

import User from "../models/userSchema.js";
import { ApiError } from "../utilis/apiError.js";
import { apiResponse } from "../utilis/apiResponse.js";

export const createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError('User already exists', 400);
    }

    const user = await User.create({
        name,
        email,
        password,
    });
    if (!user) {
        throw new ApiError('User creation failed', 400);
    }

    return apiResponse.success(res, "User created successfully", "N/A", 201);
})


export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }   
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError('Invalid email or password', 401);
    }
    const token = user.getSignedJwtToken();

        res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',

        maxAge: 24 * 60 * 60 * 1000,
      });

    return apiResponse.success(res, "User logged in successfully", { token }, 200);
}
)

export const getUser = asyncHandler(async (req, res, next) => {

    const { id } = req.user;
    if (!id) {
        throw new ApiError('User ID is required', 400);
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
        throw new ApiError('User not found', 404);
    }
    return apiResponse.success(res, "User fetched successfully", user, 200);
}
)


  export const logout = async (req, res) => {
    try {
  
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        path: '/', 
        maxAge: 0, 
      });
  
      console.log('Cookie cleared successfully');
      return res.status(200).json({ message: 'Logout successful',success:true });
    } catch (err) {
      console.error('Logout error:', err.message, err.stack);
      return res.status(500).json({ message: 'Internal Server error' });
    }
  };