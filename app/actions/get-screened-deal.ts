"use server";
import "server-only";

import prismaDB from "@/lib/prisma";
import { Deal, DealType } from "@prisma/client";
import { unstable_cache } from "next/cache";

interface GetDealsResult {
  data: Deal[];
  totalCount: number;
  totalPages: number;
}

export default async function GetDeals({
  search,
  offset = 0,
  limit = 20,
  dealType,
}: {
  search?: string | undefined;
  offset?: number;
  limit?: number;
  dealType: DealType;
}): Promise<GetDealsResult> {
  const [data, totalCount] = await Promise.all([
    prismaDB.deal.findMany({
      where: { dealType, dealCaption: { contains: search } },
      skip: offset,
      take: limit,
    }),

    prismaDB.deal.count({
      where: { dealType, dealCaption: { contains: search } },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages };
}

/**
 *
 * get all deals with pagination and filter by deal type
 *
 * @param search - search query
 * @param offset - offset
 * @param limit - limit
 * @param dealTypes - deal types
 * @returns
 */
export const GetAllDeals = async ({
  search,
  offset = 0,
  limit = 20,
  dealTypes,
  ebitda,
  askingPrice,
  location,
  industry,
  revenue,
}: {
  search?: string | undefined;
  offset?: number;
  limit?: number;
  dealTypes?: DealType[];
  ebitda?: string;
  askingPrice?: string;
  location?: string;
  industry?: string;
  revenue?: string;
}): Promise<GetDealsResult> => {
  const ebitdaValue = ebitda ? parseFloat(ebitda) : undefined;
  const revenueValue = revenue ? parseFloat(revenue) : undefined; // move these into floats for searching
  const askingPriceValue = askingPrice ? parseFloat(askingPrice) : undefined;
  const locationValue = location ? location : undefined;
  const industryValue = industry ? industry : undefined;

  const whereClause = {
    ...{bitrixId: { not: null } } ,
    ...(search ? { dealCaption: { contains: search } } : {}),
    ...(dealTypes && dealTypes.length > 0
    ? { dealType: { in: dealTypes } }
    : {}),
    ...(ebitdaValue !== undefined ? { ebitda: { gte: ebitdaValue } } : {}),
    ...(revenueValue !== undefined ? { revenue : { gte: revenueValue} } : {}), // searches for greater than or equal to
    ...(askingPriceValue !== undefined ? { askingPrice : { gte: askingPriceValue} } : {}),
    ...(locationValue !== undefined ? { location: { contains: locationValue} } : {}),
    ...(industryValue !== undefined ? { industry: { contains: industryValue} } : {}),
  };

  console.log("whereClause", whereClause);

  const [data, totalCount] = await Promise.all([
    prismaDB.deal.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prismaDB.deal.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages };
};
