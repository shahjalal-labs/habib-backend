import { Request, Response } from 'express';
import { CountryLocationsServices } from './CountryLocations.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';

const createCountry = catchAsync(async (req: Request, res: Response) => {
  const result = await CountryLocationsServices.createCountry(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Country has been created successfully',
    data: result,
  });
});

const getAllCountries = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder']);
  const result = await CountryLocationsServices.getAllCountries(filters);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Countries retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCountryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CountryLocationsServices.getCountryById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Country retrieved successfully',
    data: result,
  });
});

const updateCountry = catchAsync(async (req: Request, res: Response) => {
  const result = await CountryLocationsServices.updateCountry(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Country has been updated successfully',
    data: result,
  });
});

const deleteCountry = catchAsync(async (req: Request, res: Response) => {
  await CountryLocationsServices.deleteCountry(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Country has been deleted successfully',
  });
});

export const CountryLocationsControllers = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
};
  