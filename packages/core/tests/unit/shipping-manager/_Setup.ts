import { SharedMemory } from "../../../src/adapters/mock/SharedMemory"

export const setup = () => {
    SharedMemory.countries = [
        {
            code: 'FR',
            name: 'France'
        },
        {
            code: 'BE',
            name: 'Belgique'
        },
        {
            code: 'DE',
            name: 'Allemagne'
        },
        {
            code: 'IT',
            name: 'Italie'
        },
        {
            code: 'ES',
            name: 'Espagne'
        },
        {
            code: 'US',
            name: 'United States'
        },
        {
            code: 'GB',
            name: 'United Kingdom'
        },
        {
            code: 'CA',
            name: 'Canada'
        },
        {
            code: 'AU',
            name: 'Australia'
        },
        {
            code: 'JP',
            name: 'Japan'
        }
    ];
    SharedMemory.countriesWithoutTva = [
        {
            code: 'FR'
        },
        {
            code: 'BE'
        },
        {
            code: 'DE'
        },
        {
            code: 'IT'
        },
        {
            code: 'ES'
        }
    ];
    SharedMemory.shipmentConfs = [
        {
            mode_livraison: 'SO_COLISSIMO',
            zone: 'France',
            poids_min: 0,
            poids_max: 1000,
            prix: 5,
            livraison_zones_pays: [
                {
                    code: 'FR',
                    livraison_pays: {
                        nom: 'France'
                    }
                },
                {
                    code: 'MC',
                    livraison_pays: {
                        nom: 'Monaco'
                    }
                },
                {
                    code: 'AD',
                    livraison_pays: {
                        nom: 'Andorre'
                    }
                }
            ]
        },
        {
            mode_livraison: 'SO_COLISSIMO',
            zone: 'France',
            poids_min: 1000,
            poids_max: 2000,
            prix: 6,
            livraison_zones_pays: [
                {
                    code: 'FR',
                    livraison_pays: {
                        nom: 'France'
                    }
                },
                {
                    code: 'MC',
                    livraison_pays: {
                        nom: 'Monaco'
                    }
                },
                {
                    code: 'AD',
                    livraison_pays: {
                        nom: 'Andorre'
                    }
                }
            ]
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'France',
            poids_min: 0,
            poids_max: 1000,
            prix: 8,
            livraison_zones_pays: [
                {
                    code: 'FR',
                    livraison_pays: {
                        nom: 'France'
                    }
                },
                {
                    code: 'MC',
                    livraison_pays: {
                        nom: 'Monaco'
                    }
                },
                {
                    code: 'AD',
                    livraison_pays: {
                        nom: 'Andorre'
                    }
                }
            ]
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'Italie',
            poids_min: 1000,
            poids_max: 2000,
            prix: 10,
            livraison_zones_pays: [
                {
                    code: 'IT',
                    livraison_pays: {
                        nom: 'Italie'
                    }                    
                },
                {
                    code: 'SM',
                    livraison_pays: {
                        nom: 'San Marino'
                    }
                },
                {
                    code: 'VA',
                    livraison_pays: {
                        nom: 'Vatican City'
                    }
                }
            ]
        }
    ];
    SharedMemory.shipmentsZonesCountries = [
        {
            mode_livraison: 'SO_COLISSIMO',
            zone: 'France',
            code: 'FR'
        },
        {
            mode_livraison: 'SO_COLISSIMO',
            zone: 'France',
            code: 'MC'
        },
        {
            mode_livraison: 'SO_COLISSIMO',
            zone: 'France',
            code: 'AD'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'France',
            code: 'FR'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'France',
            code: 'MC'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'France',
            code: 'AD'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'Italie',
            code: 'IT'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'Italie',
            code: 'SM'
        },
        {
            mode_livraison: 'CHRONOPOST',
            zone: 'Italie',
            code: 'VA'
        }
    ];
}

export const teardown = () => {
    SharedMemory.clear();
}