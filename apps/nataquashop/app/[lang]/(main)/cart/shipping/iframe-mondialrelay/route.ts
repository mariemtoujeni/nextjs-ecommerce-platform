import { NextResponse } from "next/server";

export async function GET() {
  try {
    const html = `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Sélection Point Relais</title>
    <link rel="stylesheet" type="text/css" href="//unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script type="text/javascript" src="//unpkg.com/leaflet/dist/leaflet.js"></script> 
    <script type="text/javascript" src="https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js"></script>  
  </head>
  <body>

    <div id="mondial-relai-widget"></div>
    <input type="hidden" id="mondial-relai-code" />

    <script>
      \$(document).ready(function () {   
        \$("#mondial-relai-widget").MR_ParcelShopPicker({     
            Target: "#mondial-relai-code", 
            Brand: "CC20G0I2",
            Country: "FR",
            AllowedCountries: "BE,LU,ES,IT,PT,NL,AT",
            Theme: "mondialrelay",
            Responsive: true,
            City: "Paris",
            PostCode: "75001",
            EnableGeolocalisatedSearch: true,
            OnParcelShopSelected: function(data) {
              // Send city and postal code to parent window
              window.parent.postMessage(
                {
                  type: "parcelshop-selected",
                  dataSelected: data,
                },
                "*"
              );
            }

        });  
      }); 
    </script>

  </body>
</html>
`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (err) {
    return new NextResponse(
      `<html><body><h1>Erreur de chargement</h1><p>${(err as Error).message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
