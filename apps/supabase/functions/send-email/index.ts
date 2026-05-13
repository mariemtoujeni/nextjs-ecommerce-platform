// Setup type definitions for built-in Supabase Runtime APIs
import { EmailType, mailDispatcher } from "../_shared/EmailFunctions.ts";
import {  registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient }) => {
  const origin = req.headers.get('Origin');
  if(!origin) { 
      throw new Error(`Invalid origin ${origin}`);
  }

  let body: any;
  const contentType = req.headers.get('Content-Type');
  if(contentType && contentType.includes('application/json')) {
      body = await req.json();
  } else {
      body = await req.formData();
  }

  if(!body.emailType) { // only numero_client and emailType is required
    throw new Error(`Invalid email type`);
  }

  switch(body.emailType) {    
    case EmailType.EMAIL_DEMANDE_AVIS: {
      await mailDispatcher[EmailType.EMAIL_DEMANDE_AVIS](userClient);
      break;
    }
    case EmailType.EMAIL_Modele_DISPONIBLE: {
      if(!body.id)  {
        throw new Error(`Invalid id`);
      }      
       return await mailDispatcher[EmailType.EMAIL_Modele_DISPONIBLE](userClient, parseInt(body.id));
    }
    default:
      throw new Error(`Invalid email type`);
  }

  return { success: true, body: 'Email sent' };
});
