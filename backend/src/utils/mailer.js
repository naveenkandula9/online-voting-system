import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVoteEmail = async (toEmail) => {
  console.log('Sending email to:', toEmail);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Vote Confirmation',
    text: 'Your vote has been successfully cast in the election system.',
  });
};

export const sendResultEmail = async (toEmail, winnerName) => {
  console.log('Sending email to:', toEmail);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Election Result',
    text: `Election completed. Winner is ${winnerName}.`,
  });
};
