import { Font } from "@react-pdf/renderer";

// Cache for loaded fonts
let fontsRegistered = false;
let fontRegistrationPromise: Promise<boolean> | null = null;

/**
 * Loads a font file and converts it to a base64 data URL
 */
async function loadFontAsDataURL(fontPath: string): Promise<string> {
  try {
    // Add cache-busting parameter to ensure we get fresh fonts
    const cacheBuster = `?v=${Date.now()}`;
    const url = fontPath + cacheBuster;
    
    console.log(`Loading font from: ${url}`);
    const response = await fetch(url, {
      cache: "no-cache",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load font: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`Font loaded, size: ${blob.size} bytes, type: ${blob.type}`);
    
    // Verify it's actually a font file (not HTML)
    if (blob.type && !blob.type.includes("font") && !blob.type.includes("octet")) {
      console.warn(`Warning: Font file type is ${blob.type}, expected font/ttf or application/octet-stream`);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const dataUrl = reader.result;
          console.log(`Font converted to data URL, length: ${dataUrl.length} characters`);
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to convert font to data URL"));
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to convert font to data URL"));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error loading font from ${fontPath}:`, error);
    throw error;
  }
}

/**
 * Registers Noto Sans fonts for PDF generation
 * This function is idempotent - it can be called multiple times safely
 */
export async function registerPDFFonts(): Promise<boolean> {
  if (fontsRegistered) {
    return true;
  }

  // If registration is in progress, wait for it
  if (fontRegistrationPromise) {
    return fontRegistrationPromise;
  }

  fontRegistrationPromise = (async () => {
    try {
    // Load fonts as data URLs
    const [regularFont, boldFont] = await Promise.all([
      loadFontAsDataURL("/fonts/NotoSans-Regular.ttf"),
      loadFontAsDataURL("/fonts/NotoSans-Bold.ttf"),
    ]);

    // Register fonts with react-pdf
    Font.register({
      family: "NotoSansCyrillic",
      fonts: [
        {
          src: regularFont,
          fontWeight: 400,
          fontStyle: "normal",
        },
        {
          src: boldFont,
          fontWeight: 700,
          fontStyle: "normal",
        },
      ],
    });

      fontsRegistered = true;
      console.log("Noto Sans Cyrillic fonts registered successfully for PDF");
      fontRegistrationPromise = null;
      return true;
    } catch (error) {
      console.warn(
        "Failed to register PDF fonts, will use Helvetica fallback:",
        error
      );
      fontsRegistered = false;
      fontRegistrationPromise = null;
      return false;
    }
  })();

  return fontRegistrationPromise;
}

