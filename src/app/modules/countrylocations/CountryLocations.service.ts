import { PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

const prisma = new PrismaClient();

interface GetAllCountriesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============= COUNTRY SERVICES =============
const createCountry = async (data: any) => {
  const { CountrySectionInfo, ...countryData } = data;

  // Create country with nested data
  const result = await prisma.country.create({
    data: {
      ...countryData,
      CountrySectionInfo: CountrySectionInfo
        ? {
            create: CountrySectionInfo.map((section: any) => ({
              title: section.title,
              CountryCardInfo: section.CountryCardInfo
                ? {
                    create: section.CountryCardInfo.map((card: any) => ({
                      icon: card.icon,
                      title: card.title,
                      description: card.description,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: {
      CountrySectionInfo: {
        include: {
          CountryCardInfo: true,
        },
      },
    },
  });
  return result;
};

const getAllCountries = async (query: GetAllCountriesParams) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  // Build where conditions for search
  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { address: { contains: searchTerm, mode: 'insensitive' } },
      { phone: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Fetch countries with pagination
  const countries = await prisma.country.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      CountrySectionInfo: {
        include: {
          CountryCardInfo: true,
        },
      },
    },
  });

  // Get total count
  const total = await prisma.country.count({ where });

  const meta: PaginationMeta = {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  };

  return {
    meta,
    data: countries,
  };
};

const getCountryById = async (id: string) => {
  const result = await prisma.country.findUnique({
    where: { id },
    include: {
      CountrySectionInfo: {
        include: {
          CountryCardInfo: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }

  return result;
};

const updateCountry = async (id: string, data: any) => {
  // Check if country exists
  const existingCountry = await prisma.country.findUnique({ where: { id } });
  if (!existingCountry) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }

  const { CountrySectionInfo, ...countryData } = data;

  // If CountrySectionInfo is provided, delete old ones and create new ones
  if (CountrySectionInfo) {
    // Delete existing sections and their cards (cascade)
    await prisma.countrySectionInfo.deleteMany({
      where: { countryId: id },
    });
  }

  const result = await prisma.country.update({
    where: { id },
    data: {
      ...countryData,
      CountrySectionInfo: CountrySectionInfo
        ? {
            create: CountrySectionInfo.map((section: any) => ({
              title: section.title,
              CountryCardInfo: section.CountryCardInfo
                ? {
                    create: section.CountryCardInfo.map((card: any) => ({
                      icon: card.icon,
                      title: card.title,
                      description: card.description,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: {
      CountrySectionInfo: {
        include: {
          CountryCardInfo: true,
        },
      },
    },
  });

  return result;
};

const deleteCountry = async (id: string) => {
  // Check if country exists
  const existingCountry = await prisma.country.findUnique({ where: { id } });
  if (!existingCountry) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }

  // Delete all related section infos and card infos (cascade)
  await prisma.countrySectionInfo.deleteMany({
    where: { countryId: id },
  });

  await prisma.country.delete({ where: { id } });
};

export const CountryLocationsServices = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
};
  