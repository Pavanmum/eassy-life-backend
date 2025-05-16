import { asyncHandler } from "../middleware/asyncHandler.js";
import Booking from "../models/bookingSchema.js";
import Service from "../models/serviceSchema.js";
import { ApiError } from "../utilis/apiError.js";
import { apiResponse } from "../utilis/apiResponse.js";

export const createBooking = asyncHandler(async (req, res, next) => {
    const { serviceId, slotId } = req.body;

    const userId = req.user.id;

    if (!serviceId || !userId || !slotId) {
        throw new ApiError("Please provide serviceId, userId, and slotId", 400);
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError("Service not found", 404);
    }

    // Find the slot by slotId
    const slot = service.availableSlots.find(slot => slot._id.toString() === slotId);
    if (!slot) {
        throw new ApiError("Time slot not found for this service", 404);
    }

    const parsedStartTime = new Date(slot.startTime);
    const parsedEndTime = new Date(slot.endTime || parsedStartTime.getTime() + service.duration * 60 * 60 * 1000);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        throw new ApiError("Invalid date/time values for slot", 400);
    }

    // Optional: Prevent double booking for this slot
    const existingBooking = await Booking.findOne({
        service: serviceId,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: "confirmed",
        slot: slotId,
    });

    if (existingBooking) {
        throw new ApiError("This time slot is already booked", 409);
    }

    const booking = await Booking.create({
        service: serviceId,
        user: userId,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: "confirmed",
        slot: slotId,

    });

    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        {
            $set: {
                "availableSlots.$[slot].isBooked": true,
            },
        },
        {
            arrayFilters: [{ "slot._id": slotId }],
            new: true,
        }
    );

    return apiResponse.success(res, "Booking created successfully", booking, 201);
});

export const myBooking = asyncHandler(async (req, res, next) => {
    const { id } = req.user;

    if (!id) {
        throw new ApiError("Please provide userId", 400);
    }

    const bookings = await Booking.find({ user: id })
        .populate({
            path: "service",
            select: "name price",
        })
        .populate({
            path: "user",
            select: "name email",
        });

    return apiResponse.success(res, "Bookings retrieved successfully", bookings);
});

export const deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError("Please provide bookingId", 400);
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  const service = await Service.findById(booking.service);
  if (!service) {
    throw new ApiError("Service not found", 404);
  }

  const slotExists = service.availableSlots.find(
    (slot) => slot._id.toString() === booking.slot.toString()
  );

  if (!slotExists) {
    throw new ApiError("Time slot not found for this service", 404);
  }

  await Service.findByIdAndUpdate(
    booking.service,
    {
      $set: {
        "availableSlots.$[slot].isBooked": false,
      },
    },
    {
      arrayFilters: [{ "slot._id": booking.slot }],
      new: true,
    }
  );

  await Booking.findByIdAndDelete(id);

  return apiResponse.success(res, "Booking deleted successfully", booking);
});

