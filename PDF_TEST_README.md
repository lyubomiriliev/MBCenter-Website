# PDF Test Page

This is a standalone test page for verifying PDF generation without requiring the full application setup (Supabase, authentication, etc.).

## Accessing the Test Page

Once the development server is running, navigate to:

- **Bulgarian locale**: `http://localhost:3000/bg/pdf-test`
- **English locale**: `http://localhost:3000/en/pdf-test`

## Features

The test page includes:

1. **Mock Data**: Pre-configured sample offer data with:
   - Customer information (Bulgarian Cyrillic text)
   - Car details (Mercedes-Benz E-Class)
   - 4 parts/items
   - 4 service actions
   - All necessary fields for PDF generation

2. **Two PDF Types**:
   - **Offer PDF**: Full offer document with parts and service actions
   - **Service Card PDF**: Service card format

3. **Font Status Indicator**: Shows whether NotoSans fonts are loaded correctly

4. **Error Handling**: Displays any errors that occur during PDF generation

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the test page URL (e.g., `http://localhost:3000/bg/pdf-test`)

3. Click either button to generate and download the PDF:
   - "Generate Offer PDF" - Creates the full offer document
   - "Generate Service Card PDF" - Creates the service card

4. The PDF will automatically download to your browser's download folder

## What to Verify

When testing the generated PDFs, check:

1. **Cyrillic Text Rendering**:
   - All Bulgarian text should display correctly (not as garbled characters)
   - Company name: "╨Х╨Ь ╨С╨Ш ╨ж╨Х╨Э╨в╨к╨а ╨Ю╨Ю╨Ф"
   - Customer name: "╨Ш╨▓╨░╨╜ ╨Я╨╡╤В╤А╨╛╨▓"
   - All table headers and content in Cyrillic

2. **Table Layout**:
   - Parts table should have 7 columns with proper alignment
   - Service actions table should have 5 columns
   - No overlapping text
   - All items visible in their respective columns

3. **Summary Section**:
   - Proper calculation of totals
   - Correct VAT calculations
   - Proper formatting of BGN and EUR values

4. **Overall Layout**:
   - No text overflow
   - Proper spacing
   - All sections visible

## Mock Data Details

The mock offer includes:

- **Offer Number**: OFF-2024-001
- **Customer**: ╨Ш╨▓╨░╨╜ ╨Я╨╡╤В╤А╨╛╨▓
- **Phone**: 0887123456
- **Car**: Mercedes-Benz E-Class (W213)
- **VIN**: WDD2130041A123456
- **Parts**: 4 items (oil filter, air filter, spark plugs, belt)
- **Service Actions**: 4 actions (oil change, diagnostics, spark plug replacement, belt adjustment)

## Troubleshooting

If fonts are not loading:
- Check that font files exist in `public/fonts/`:
  - `NotoSans-Regular.ttf`
  - `NotoSans-Bold.ttf`
- If missing, run the download script or manually download from Google Fonts

If PDF generation fails:
- Check browser console for errors
- Verify that `@react-pdf/renderer` is properly installed
- Ensure the development server is running
