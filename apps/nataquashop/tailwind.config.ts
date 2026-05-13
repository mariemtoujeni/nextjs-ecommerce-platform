// tailwind config is required for editor support

import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Partial<Config> = {
	mode: "jit",
    darkMode: ["class"],
    content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  	presets: [sharedConfig],
    plugins: [require("tailwindcss-animate")],
    theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
				black: '#000000',
				graylight: '#EDEDED',
				gray:'#B0B0B0',
				green: {
					200: '#B4FED2',
					600: '#2A704F'
				},
				lime: "#E7FF56",
				red: {
					100: '#fbefed',
					600: '#d33620',
					700: '#cf3416',
					900: '#87220e'
				},
				neutral: {
					100: '#f1f1f1',
					200: '#efefef',
					300: '#d9d9d9',
					500: '#6a6a6a'
				},
				
    		},
			fontSize: {
				xl: '1.25rem',
				'10xl': '10rem',
			},
			typography: {
				DEFAULT: {
					css: {
						p: {
							fontSize: '1rem',
							lineHeight: '1.4',
							color: 'rgba(0, 0, 0, 0.7)',
							fontWeight: '400'
						}
					}
				}
			},
			aspectRatio: {
				'2/3': '2 / 3',
			},
			fontFamily: {
				bebas: ['var(--font-bebas)', 'sans-serif'],
			}
    	}
    }
};

export default config;
