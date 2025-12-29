import express from 'express';
import { CountryLocationsControllers } from './CountryLocations.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CountryLocationsSchemaValidation } from './CountryLocations.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Admin only: Create, Update, Delete
router.post(
  '/',
  auth(UserRole.Admin),
  validateRequest(CountryLocationsSchemaValidation.createCountrySchema),
  CountryLocationsControllers.createCountry
);

router.patch(
  '/:id',
  auth(UserRole.Admin),
  validateRequest(CountryLocationsSchemaValidation.updateCountrySchema),
  CountryLocationsControllers.updateCountry
);

router.delete(
  '/:id',
  auth(UserRole.Admin),
  CountryLocationsControllers.deleteCountry
);

// Public: Read operations
router.get('/', CountryLocationsControllers.getAllCountries);
router.get('/:id', CountryLocationsControllers.getCountryById);

export const CountryLocationsRoutes = router;
  