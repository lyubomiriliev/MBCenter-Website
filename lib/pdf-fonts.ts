import { Font } from "@react-pdf/renderer";

const FONTS: { family: string; src: string; fontWeight: number }[] = [
  { family: "NotoSans", src: "/fonts/NotoSans-Regular.ttf", fontWeight: 400 },
  { family: "NotoSans", src: "/fonts/NotoSans-Bold.ttf", fontWeight: 700 },
];

// Track registration state
let fontsRegistered = false;

export async function registerPDFFonts(): Promise<boolean> {
  // If already registered, return true
  if (fontsRegistered) {
    return true;
  }

  try {
    // First, verify fonts are accessible by fetching them
    const fontChecks = await Promise.all(
      FONTS.map(async ({ src }) => {
        try {
          const res = await fetch(src, { method: "GET", cache: "force-cache" });
          if (!res.ok) {
            throw new Error(`Font not accessible: ${src} (${res.status})`);
          }
          // Ensure we can read the response
          await res.arrayBuffer();
          return true;
        } catch (error) {
          console.error(`Failed to load font ${src}:`, error);
          throw error;
        }
      })
    );

    if (!fontChecks.every(Boolean)) {
      throw new Error("Some fonts failed to load");
    }

    // Register with react-pdf using URLs (browser environment)
    // Note: In browser, react-pdf expects URL strings, not ArrayBuffer
    FONTS.forEach((f) => {
      try {
        Font.register({
          family: f.family,
          src: f.src, // URL string for browser
          fontWeight: f.fontWeight,
        });
      } catch (registerError) {
        console.error(`Failed to register font ${f.family}:`, registerError);
        throw registerError;
      }
    });

    // Wait a bit longer to ensure fonts are fully processed by react-pdf
    await new Promise((resolve) => setTimeout(resolve, 200));

    fontsRegistered = true;
    console.log("PDF fonts registered successfully");
    return true;
  } catch (err) {
    console.error("registerPDFFonts error", err);
    fontsRegistered = false;
    return false;
  }
}

