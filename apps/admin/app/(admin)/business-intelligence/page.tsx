export default function BusinessIntelligencePage() {
    return (
        <div>
          <div
            style={{
              width: "100%",
              height: "90vh",
              minHeight: "90vh",
              margin: 0,
              padding: 0,
              borderRadius: "16px", // Ajoute cette ligne pour arrondir les coins
              overflow: "hidden"    // Ajoute cette ligne pour que l'iframe suive l'arrondi
            }}
          >            
            <iframe
              src="https://dev.bi.nataquashop.com/public/dashboard/47dc5496-b699-4479-88f4-f2611e5a1338"
              frameBorder="0"
              width="100%"
              height="100%"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                border: 0
              }}
            ></iframe>
          </div>
        </div>
      );
}