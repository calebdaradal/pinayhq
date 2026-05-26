import { RequestHandler } from "express";
import { CtaConfigResponse } from "@shared/api";

export const handleCtaConfig: RequestHandler = (_req, res) => {
  const ctaUrl = process.env.CTA_URL ?? "";
  const response: CtaConfigResponse = { ctaUrl };
  res.status(200).json(response);
};
