import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import ContactNotification from "@/emails/AdminNotification";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  send: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1),
      email: z.email(),
      // "What do you need?" checkboxes (zero or more)
      needs: z.array(z.string().max(60)).max(10).default([]),
      message: z
        .string()
        .max(5000)
        .nullish()
        .transform((v) => v ?? ""),
      "cf-turnstile-response": z.string().min(1),
    }),
    handler: async (input) => {
      const { name, email, needs, message } = input;
      const token = input["cf-turnstile-response"];

      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: import.meta.env.TURNSTILE_SECRET_KEY,
            response: token,
          }),
        },
      );
      const { success } = await verify.json();
      if (!success) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Security check failed. Please try again.",
        });
      }

      const { data, error } = await resend.emails.send({
        from: "Jason Marshall Digital <website@jasonmarshall.digital>",
        to: ["contact@jasonmarshall.digital"],
        replyTo: email,
        subject: `New project brief from ${name}`,
        react: ContactNotification({ name, email, needs, message }),
      });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    },
  }),
};
