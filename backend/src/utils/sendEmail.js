import nodemailer from "nodemailer"

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        server:"gmail",
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
    })

    const mailsent=await transporter.sendMail(options);
    if(mailsent){
        return true;
    }
    else{
        return false;
    }
}

export {sendEmail};