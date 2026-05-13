import { getCheckoutFormTokenAction } from "@repo/actions/cart";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const formCheckout = await getCheckoutFormTokenAction();
    const html = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <title>Paiement sécurisé</title>
            <link rel="stylesheet" href="https://static.systempay.fr/static/js/krypton-client/V4.0/ext/neon-reset.min.css">
            <script type="text/javascript" src="https://static.systempay.fr/static/js/krypton-client/V4.0/ext/neon.js"></script>
            <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
          </head>
          <body>
            <div class="kr-smart-form" kr-card-form-expanded kr-form-token="${formCheckout.item.token}"></div>
            <div id="customerror"></div>

            <script type="text/javascript">
              \$(document).ready(function() {
                var script = document.createElement("script");
                script.setAttribute("kr-public-key", "${formCheckout.item.pubKey}");
                script.setAttribute("src", "https://static.systempay.fr/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js");
                document.body.appendChild(script);
                script.addEventListener("load", function(e) {
                  KR.onSubmit(function(event) {
                    window.parent.postMessage(
                      {
                        type: "payment-submitted",
                        data: {
                          "hashAlgorithm": event.hashAlgorithm,
                          "clientAnswer": event.clientAnswer,
                          "hash": event.hash,
                          "rawClientAnswer": event.rawClientAnswer
                        }
                      },
                      "*"
                    );
                  });
                  KR.onError(function(error) {
                    console.log(error);
                    window.parent.postMessage(
                      {
                        type: "payment-error",
                        error: error
                      },
                      "*"
                    );
                  });
                });

                script.addEventListener("error", function(e) {
                  console.error('Error on KR load', e);
                  console.error("Error on KR load", e);
                  window.parent.postMessage(
                    {
                      type: "payment-error",
                      error: { message: "Impossible de charger le formulaire de paiement" }
                    },
                    "*"
                  );
                });
              });
            </script>
          </body>
        </html>
        `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err) {
    return new NextResponse(
      `<html><body><h1>Erreur de paiement</h1><p>${(err as Error).message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
