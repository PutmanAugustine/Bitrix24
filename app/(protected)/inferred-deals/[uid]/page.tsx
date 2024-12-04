import React, { Suspense } from "react";

import {
  Check,
  CreditCard,
  Cross,
  DollarSignIcon,
  Handshake,
  Hash,
  MapPinIcon,
  MinusCircle,
  Tag,
  Edit,
  ExternalLink,
  WebhookIcon,
  Phone,
  DollarSign,
  Building,
  Briefcase,
  Percent,
  Plus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import path from "path";
import * as fs from "fs/promises";
import { Metadata } from "next";
import { MdOutlineNumbers } from "react-icons/md";
import { fetchSpecificInferredDeal } from "@/lib/firebase/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PreviousPageButton from "@/components/PreviousPageButton";
import ScreenDealDialog from "@/components/Dialogs/screen-deal-dialog";
import prismaDB from "@/lib/prisma";
import { DealDetailItem } from "@/components/DealDetailItem";
import AIReasoning from "@/components/AiReasoning";
import SimUploadDialog from "@/components/Dialogs/sim-upload-dialog";
import SimItemSkeleton from "@/components/skeletons/SimItemSkeleton";
import FetchDealSim from "@/components/FetchDealSim";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIReasoningSkeleton from "@/components/skeletons/AIReasoningSkeleton";
import FetchDealAIScreenings from "@/components/FetchDealAIScreenings";

type Params = Promise<{ uid: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await props.params;

  try {
    const fetchedDeal = await prismaDB.deal.findUnique({
      where: {
        id: uid,
      },
    });

    return {
      title: fetchedDeal?.title || "Specific Deal",
      description: fetchedDeal?.dealCaption || "Generated by create next app",
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const InferredDealSpecificPage = async (props: { params: Params }) => {
  const { uid } = await props.params;

  const fetchedDeal = await prismaDB.deal.findUnique({
    where: {
      id: uid,
    },
  });

  if (!fetchedDeal) {
    return (
      <section className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Deal Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The deal you are looking for does not exist or has been removed.
            </p>
            <Button asChild className="mt-4">
              <Link href="/manual-deals">Back to Manual Deals</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const {
    id,
    firstName,
    lastName,
    workPhone,
    revenue,
    ebitda,
    title,
    sourceWebsite,
    brokerage,
    dealCaption,
    companyLocation,
    industry,
    ebitdaMargin,
    askingPrice,
    grossRevenue,
    dealType,
  } = fetchedDeal;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <PreviousPageButton />
      </div>

      <div className="mb-8 text-center">
        <Badge variant="secondary" className="mb-4">
          Inferred Deal
        </Badge>
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {dealCaption}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href={`/inferred-deals/${uid}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Deal
          </Link>
        </Button>
        {sourceWebsite && (
          <Button asChild variant="outline">
            <Link href={sourceWebsite}>
              <ExternalLink className="mr-2 h-4 w-4" /> Visit Website
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inferred Deal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DealDetailItem icon={<Hash />} label="Deal ID" value={id} />
            <DealDetailItem
              icon={<Tag />}
              label="Name"
              value={`${firstName} ${lastName}`}
            />
            <DealDetailItem
              icon={<Phone />}
              label="Work Phone"
              value={workPhone}
            />

            <DealDetailItem
              icon={<DollarSign />}
              label="Revenue"
              value={revenue}
            />
            <DealDetailItem
              icon={<DollarSign />}
              label="EBITDA"
              value={ebitda}
            />
            <DealDetailItem
              icon={<Building />}
              label="Brokerage"
              value={brokerage}
            />
            <DealDetailItem
              icon={<MapPinIcon />}
              label="Location"
              value={companyLocation}
            />
            <DealDetailItem
              icon={<Briefcase />}
              label="Industry"
              value={industry}
            />
            <DealDetailItem
              icon={<Percent />}
              label="EBITDA Margin"
              value={ebitdaMargin}
            />
            <DealDetailItem
              icon={<CreditCard />}
              label="Asking Price"
              value={askingPrice as number}
            />
            <DealDetailItem
              icon={<DollarSign />}
              label="Gross Revenue"
              value={grossRevenue as number}
            />
          </CardContent>
        </Card>

        <Card className="lg:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Reasoning</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manual-deals/${id}/screen`}>
                <Plus className="mr-2 h-4 w-4" /> Add AI Reasoning
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px] pr-4">
              <Suspense
                fallback={
                  <div className="flex flex-col gap-4">
                    <AIReasoningSkeleton />
                    <AIReasoningSkeleton />
                    <AIReasoningSkeleton />
                  </div>
                }
              >
                <FetchDealAIScreenings dealId={uid} dealType={dealType} />
              </Suspense>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>SIMs (Strategic Investment Memos)</CardTitle>
            <SimUploadDialog dealId={uid} dealType={dealType} />
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex flex-col gap-4">
                  <SimItemSkeleton />
                  <SimItemSkeleton />
                </div>
              }
            >
              <ScrollArea className="h-[300px] pr-4">
                <FetchDealSim dealId={uid} dealType={dealType} />
              </ScrollArea>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InferredDealSpecificPage;
