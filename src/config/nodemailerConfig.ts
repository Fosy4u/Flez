const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

if (!NODEMAILER_USER || !NODEMAILER_PASS) {
  throw new Error("Missing Nodemailer environment variables");
}

export const NODEMAILER_CONFIG = {
  USER: NODEMAILER_USER,
  PASS: NODEMAILER_PASS,
};
