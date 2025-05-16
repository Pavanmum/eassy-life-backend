import { asyncHandler } from "../middleware/asyncHandler.js";
import Service from "../models/serviceSchema.js";
import { apiResponse } from "../utilis/apiResponse.js";
import { parse } from 'date-fns';

export const createService = asyncHandler(async (req, res, next) => {
  const { name, description, price, duration, startTime } = req.body;

  if (!name || !description || !price || !duration || !startTime) {
    throw new Error("Please provide all required fields", 400);
  }

  const parsedStartTime = parse(startTime, 'h:mm a d MMM yyyy', new Date());

  if (isNaN(parsedStartTime.getTime())) {
    throw new Error("Invalid date format. Please use '3:00 pm 15 May 2025'", 400);
  }

  const parsedEndTime = new Date(parsedStartTime.getTime() + duration * 60 * 60 * 1000);

  const existingService = await Service.findOne({ name });

  if (existingService) {
    const slotExists = existingService.availableSlots.some(slot =>
      new Date(slot.startTime).getTime() === parsedStartTime.getTime()
    );

    if (slotExists) {
      throw new Error("Service with this start time already exists", 409);
    }

    existingService.availableSlots.push({
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    });

    await existingService.save();
    return apiResponse.success(res, "Slot added to existing service", existingService, 200);
  }

  const newService = await Service.create({
    name,
    description,
    price,
    duration,
    availableSlots: [
      {
        startTime: parsedStartTime,
        endTime: parsedEndTime,
      },
    ],
  });

  return apiResponse.success(res, "Service created successfully", newService, 201);
});


export const getAllServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find({});
  const currentTime = new Date();

  const cleanedServices = [];

  for (const service of services) {
    
    const futureSlots = service.availableSlots.filter(
      slot => new Date(slot.startTime) >= currentTime
    );

    
    if (futureSlots.length !== service.availableSlots.length) {
      service.availableSlots = futureSlots;
      await service.save(); 
    }

    cleanedServices.push({
      ...service.toObject(),
      availableSlots: futureSlots,
    });
  }

  return apiResponse.success(
    res,
    "Services retrieved successfully",
    cleanedServices,
    200
  );
});
