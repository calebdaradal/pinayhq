import { RequestHandler } from "express";
import {
  TurnstileVerifyRequest,
  TurnstileVerifyResponse,
} from "@shared/api";

interface CloudflareTurnstileVerifyResult {
  success: boolean;
  "error-codes"?: string[];
}

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const handleTurnstileVerify: RequestHandler<
  unknown,
  TurnstileVerifyResponse,
  TurnstileVerifyRequest
> = async (req, res) => {
  const token = req.body?.token;

  if (!token) {
    res.status(400).json({
      success: false,
      message: "Missing Turnstile token.",
    });
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Turnstile secret key is not configured.",
    });
    return;
  }

  try {
    const payload = new URLSearchParams();
    payload.append("secret", secret);
    payload.append("response", token);

    const cloudflareResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!cloudflareResponse.ok) {
      res.status(502).json({
        success: false,
        message: "Unable to verify Turnstile right now.",
      });
      return;
    }

    const verificationData =
      (await cloudflareResponse.json()) as CloudflareTurnstileVerifyResult;

    if (!verificationData.success) {
      res.status(400).json({
        success: false,
        errorCodes: verificationData["error-codes"] ?? [],
        message: "Verification failed.",
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unexpected verification error.",
    });
  }
};
