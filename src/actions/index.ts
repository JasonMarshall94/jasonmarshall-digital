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
      type: z.string().min(1),
      budget: z.string().min(1),
      message: z.string().min(1),
    }),
    handler: async ({ name, email, type, budget, message }) => {
      const { data, error } = await resend.emails.send({
        from: "Jason Marshall Digital <website@jasonmarshall.digital>",
        to: ["contact@jasonmarshall.digital"],
        replyTo: email,
        subject: `New project brief from ${name}`,
        react: ContactNotification({ name, email, type, budget, message }),
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
