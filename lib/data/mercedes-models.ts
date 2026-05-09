// Mercedes-Benz Model Database (1999-2026)
// Organized by class

export interface MercedesModel {
  id: string;
  name: string;
  class: string;
  years: number[];
}

export const MERCEDES_CLASSES = [
  'A-Class',
  'B-Class',
  'C-Class',
  'CLA',
  'CLE',
  'CLK',
  'CLC',
  'CL-Class',
  'CLS',
  'E-Class',
  'EQA',
  'EQB',
  'EQC',
  'EQE',
  'EQS',
  'G-Class',
  'GLA',
  'GLB',
  'GLC',
  'GLK',
  'GLE',
  'GLS',
  'R-Class',
  'S-Class',
  'SL',
  'SLC/SLK',
  'SLS AMG',
  'AMG GT',
  'Maybach',
  'V-Class',
  'Citan',
  'T-Class',
  'Sprinter',
  'Vito',
  'X-Class',
] as const;

export type MercedesClass = typeof MERCEDES_CLASSES[number];

// Generate years array
const generateYears = (start: number, end: number): number[] => {
  const years: number[] = [];
  for (let y = start; y <= end; y++) {
    years.push(y);
  }
  return years;
};

export const MERCEDES_MODELS: MercedesModel[] = [
  // A-Class
  { id: 'w168', name: 'A-Class (W168)', class: 'A-Class', years: generateYears(1999, 2004) },
  { id: 'w169', name: 'A-Class (W169)', class: 'A-Class', years: generateYears(2004, 2012) },
  { id: 'w176', name: 'A-Class (W176)', class: 'A-Class', years: generateYears(2012, 2018) },
  { id: 'w177', name: 'A-Class (W177)', class: 'A-Class', years: generateYears(2018, 2026) },
  { id: 'v177', name: 'A-Class Sedan (V177)', class: 'A-Class', years: generateYears(2018, 2026) },

  // B-Class
  { id: 'w245', name: 'B-Class (W245)', class: 'B-Class', years: generateYears(2005, 2011) },
  { id: 'w246', name: 'B-Class (W246)', class: 'B-Class', years: generateYears(2011, 2018) },
  { id: 'w247', name: 'B-Class (W247)', class: 'B-Class', years: generateYears(2018, 2026) },

  // C-Class
  { id: 'w202', name: 'C-Class (W202)', class: 'C-Class', years: generateYears(1999, 2000) },
  { id: 'w203', name: 'C-Class (W203)', class: 'C-Class', years: generateYears(2000, 2007) },
  { id: 'c203', name: 'C-Class Sportcoupe (C203)', class: 'C-Class', years: generateYears(2001, 2007) },
  { id: 'w204', name: 'C-Class (W204)', class: 'C-Class', years: generateYears(2007, 2014) },
  { id: 'c204', name: 'C-Class Coupe (C204)', class: 'C-Class', years: generateYears(2011, 2015) },
  { id: 'w205', name: 'C-Class (W205)', class: 'C-Class', years: generateYears(2014, 2021) },
  { id: 'c205', name: 'C-Class Coupe (C205)', class: 'C-Class', years: generateYears(2015, 2021) },
  { id: 'a205', name: 'C-Class Cabrio (A205)', class: 'C-Class', years: generateYears(2016, 2021) },
  { id: 'w206', name: 'C-Class (W206)', class: 'C-Class', years: generateYears(2021, 2026) },
  { id: 'c206', name: 'C-Class Coupe (C206)', class: 'C-Class', years: generateYears(2021, 2026) },

  // CLA
  { id: 'c117', name: 'CLA (C117)', class: 'CLA', years: generateYears(2013, 2019) },
  { id: 'x117', name: 'CLA Shooting Brake (X117)', class: 'CLA', years: generateYears(2015, 2019) },
  { id: 'c118', name: 'CLA (C118)', class: 'CLA', years: generateYears(2019, 2026) },
  { id: 'x118', name: 'CLA Shooting Brake (X118)', class: 'CLA', years: generateYears(2019, 2026) },

  // CLE
  { id: 'c236', name: 'CLE Coupe (C236)', class: 'CLE', years: generateYears(2023, 2026) },
  { id: 'a236', name: 'CLE Cabriolet (A236)', class: 'CLE', years: generateYears(2024, 2026) },

  // CLK
  { id: 'c208', name: 'CLK Coupe (C208)', class: 'CLK', years: generateYears(1999, 2002) },
  { id: 'a208', name: 'CLK Cabrio (A208)', class: 'CLK', years: generateYears(1999, 2002) },
  { id: 'c209', name: 'CLK Coupe (C209)', class: 'CLK', years: generateYears(2002, 2009) },
  { id: 'a209', name: 'CLK Cabrio (A209)', class: 'CLK', years: generateYears(2002, 2009) },

  // CLC
  { id: 'cl203', name: 'CLC (CL203)', class: 'CLC', years: generateYears(2008, 2011) },

  // CL-Class
  { id: 'c215', name: 'CL-Class (C215)', class: 'CL-Class', years: generateYears(1999, 2006) },
  { id: 'c216', name: 'CL-Class (C216)', class: 'CL-Class', years: generateYears(2006, 2014) },

  // CLS
  { id: 'c219', name: 'CLS (C219)', class: 'CLS', years: generateYears(2004, 2010) },
  { id: 'c218', name: 'CLS (C218)', class: 'CLS', years: generateYears(2010, 2018) },
  { id: 'x218', name: 'CLS Shooting Brake (X218)', class: 'CLS', years: generateYears(2012, 2018) },
  { id: 'c257', name: 'CLS (C257)', class: 'CLS', years: generateYears(2018, 2024) },

  // E-Class
  { id: 'w210', name: 'E-Class (W210)', class: 'E-Class', years: generateYears(1999, 2002) },
  { id: 's210', name: 'E-Class Estate (S210)', class: 'E-Class', years: generateYears(1999, 2003) },
  { id: 'w211', name: 'E-Class (W211)', class: 'E-Class', years: generateYears(2002, 2009) },
  { id: 's211', name: 'E-Class Estate (S211)', class: 'E-Class', years: generateYears(2003, 2009) },
  { id: 'c207', name: 'E-Class Coupe (C207)', class: 'E-Class', years: generateYears(2009, 2016) },
  { id: 'a207', name: 'E-Class Cabrio (A207)', class: 'E-Class', years: generateYears(2010, 2016) },
  { id: 'w212', name: 'E-Class (W212)', class: 'E-Class', years: generateYears(2009, 2016) },
  { id: 's212', name: 'E-Class Estate (S212)', class: 'E-Class', years: generateYears(2009, 2016) },
  { id: 'w213', name: 'E-Class (W213)', class: 'E-Class', years: generateYears(2016, 2023) },
  { id: 's213', name: 'E-Class Estate (S213)', class: 'E-Class', years: generateYears(2016, 2023) },
  { id: 's213at', name: 'E-Class All-Terrain (S213)', class: 'E-Class', years: generateYears(2017, 2023) },
  { id: 'c238', name: 'E-Class Coupe (C238)', class: 'E-Class', years: generateYears(2017, 2023) },
  { id: 'a238', name: 'E-Class Cabrio (A238)', class: 'E-Class', years: generateYears(2017, 2023) },
  { id: 'w214', name: 'E-Class (W214)', class: 'E-Class', years: generateYears(2023, 2026) },
  { id: 's214', name: 'E-Class Estate (S214)', class: 'E-Class', years: generateYears(2023, 2026) },
  { id: 'x214', name: 'E-Class All-Terrain (X214)', class: 'E-Class', years: generateYears(2024, 2026) },

  // EQ Electric Models
  { id: 'h243', name: 'EQA (H243)', class: 'EQA', years: generateYears(2021, 2026) },
  { id: 'x243', name: 'EQB (X243)', class: 'EQB', years: generateYears(2021, 2026) },
  { id: 'n293', name: 'EQC (N293)', class: 'EQC', years: generateYears(2019, 2024) },
  { id: 'v295', name: 'EQE (V295)', class: 'EQE', years: generateYears(2022, 2026) },
  { id: 'x294', name: 'EQE SUV (X294)', class: 'EQE', years: generateYears(2022, 2026) },
  { id: 'v297', name: 'EQS (V297)', class: 'EQS', years: generateYears(2021, 2026) },
  { id: 'x296', name: 'EQS SUV (X296)', class: 'EQS', years: generateYears(2022, 2026) },

  // G-Class
  { id: 'w463', name: 'G-Class (W463)', class: 'G-Class', years: generateYears(1999, 2018) },
  { id: 'w463a', name: 'G-Class (W463A)', class: 'G-Class', years: generateYears(2018, 2026) },

  // GLA
  { id: 'x156', name: 'GLA (X156)', class: 'GLA', years: generateYears(2013, 2020) },
  { id: 'h247', name: 'GLA (H247)', class: 'GLA', years: generateYears(2020, 2026) },

  // GLB
  { id: 'x247', name: 'GLB (X247)', class: 'GLB', years: generateYears(2019, 2026) },

  // GLK
  { id: 'x204', name: 'GLK (X204)', class: 'GLK', years: generateYears(2008, 2015) },

  // GLC
  { id: 'x253', name: 'GLC (X253)', class: 'GLC', years: generateYears(2015, 2022) },
  { id: 'x254', name: 'GLC (X254)', class: 'GLC', years: generateYears(2022, 2026) },
  { id: 'c253', name: 'GLC Coupe (C253)', class: 'GLC', years: generateYears(2016, 2023) },
  { id: 'c254', name: 'GLC Coupe (C254)', class: 'GLC', years: generateYears(2023, 2026) },

  // GLE
  { id: 'w163', name: 'ML-Class (W163)', class: 'GLE', years: generateYears(1999, 2005) },
  { id: 'w164', name: 'ML-Class (W164)', class: 'GLE', years: generateYears(2005, 2011) },
  { id: 'w166', name: 'ML/GLE (W166)', class: 'GLE', years: generateYears(2011, 2019) },
  { id: 'c292', name: 'GLE Coupe (C292)', class: 'GLE', years: generateYears(2015, 2019) },
  { id: 'v167', name: 'GLE (V167)', class: 'GLE', years: generateYears(2019, 2026) },
  { id: 'c167', name: 'GLE Coupe (C167)', class: 'GLE', years: generateYears(2019, 2026) },

  // GLS
  { id: 'x164', name: 'GL-Class (X164)', class: 'GLS', years: generateYears(2006, 2012) },
  { id: 'x166', name: 'GL/GLS (X166)', class: 'GLS', years: generateYears(2012, 2019) },
  { id: 'x167', name: 'GLS (X167)', class: 'GLS', years: generateYears(2019, 2026) },

  // R-Class
  { id: 'w251', name: 'R-Class (W251)', class: 'R-Class', years: generateYears(2006, 2013) },
  { id: 'v251', name: 'R-Class LWB (V251)', class: 'R-Class', years: generateYears(2006, 2013) },

  // S-Class
  { id: 'w220', name: 'S-Class (W220)', class: 'S-Class', years: generateYears(1999, 2005) },
  { id: 'w221', name: 'S-Class (W221)', class: 'S-Class', years: generateYears(2005, 2013) },
  { id: 'w222', name: 'S-Class (W222)', class: 'S-Class', years: generateYears(2013, 2020) },
  { id: 'c217', name: 'S-Class Coupe (C217)', class: 'S-Class', years: generateYears(2014, 2020) },
  { id: 'a217', name: 'S-Class Cabrio (A217)', class: 'S-Class', years: generateYears(2015, 2020) },
  { id: 'w223', name: 'S-Class (W223)', class: 'S-Class', years: generateYears(2020, 2026) },

  // SL
  { id: 'r129', name: 'SL (R129)', class: 'SL', years: generateYears(1999, 2001) },
  { id: 'r230', name: 'SL (R230)', class: 'SL', years: generateYears(2001, 2011) },
  { id: 'r231', name: 'SL (R231)', class: 'SL', years: generateYears(2012, 2020) },
  { id: 'r232', name: 'SL (R232)', class: 'SL', years: generateYears(2021, 2026) },

  // SLC/SLK
  { id: 'r170', name: 'SLK (R170)', class: 'SLC/SLK', years: generateYears(1999, 2004) },
  { id: 'r171', name: 'SLK (R171)', class: 'SLC/SLK', years: generateYears(2004, 2011) },
  { id: 'r172', name: 'SLK/SLC (R172)', class: 'SLC/SLK', years: generateYears(2011, 2020) },

  // SLS AMG
  { id: 'c197', name: 'SLS AMG (C197)', class: 'SLS AMG', years: generateYears(2009, 2014) },
  { id: 'r197', name: 'SLS AMG Roadster (R197)', class: 'SLS AMG', years: generateYears(2011, 2014) },

  // AMG GT
  { id: 'c190', name: 'AMG GT (C190)', class: 'AMG GT', years: generateYears(2014, 2021) },
  { id: 'r190', name: 'AMG GT Roadster (R190)', class: 'AMG GT', years: generateYears(2016, 2021) },
  { id: 'c192', name: 'AMG GT (C192)', class: 'AMG GT', years: generateYears(2021, 2026) },
  { id: 'x290', name: 'AMG GT 4-Door (X290)', class: 'AMG GT', years: generateYears(2018, 2026) },

  // Maybach
  { id: 'x222', name: 'Maybach S-Class (X222)', class: 'Maybach', years: generateYears(2015, 2020) },
  { id: 'z223', name: 'Maybach S-Class (Z223)', class: 'Maybach', years: generateYears(2020, 2026) },
  { id: 'x167m', name: 'Maybach GLS (X167)', class: 'Maybach', years: generateYears(2020, 2026) },
  { id: 'z296m', name: 'Maybach EQS SUV', class: 'Maybach', years: generateYears(2023, 2026) },
  { id: 'v297m', name: 'Maybach EQS Sedan', class: 'Maybach', years: generateYears(2023, 2026) },

  // V-Class
  { id: 'w639', name: 'Viano (W639)', class: 'V-Class', years: generateYears(2003, 2014) },
  { id: 'w447', name: 'V-Class (W447)', class: 'V-Class', years: generateYears(2014, 2026) },
  { id: 'eqv', name: 'EQV', class: 'V-Class', years: generateYears(2020, 2026) },

  // Sprinter
  { id: 'w903', name: 'Sprinter (W903)', class: 'Sprinter', years: generateYears(1999, 2006) },
  { id: 'w906', name: 'Sprinter (W906)', class: 'Sprinter', years: generateYears(2006, 2018) },
  { id: 'w907', name: 'Sprinter (W907)', class: 'Sprinter', years: generateYears(2018, 2026) },
  { id: 'esprinter', name: 'eSprinter', class: 'Sprinter', years: generateYears(2019, 2026) },

  // Vito
  { id: 'w638', name: 'Vito (W638)', class: 'Vito', years: generateYears(1999, 2003) },
  { id: 'w639v', name: 'Vito (W639)', class: 'Vito', years: generateYears(2003, 2014) },
  { id: 'w447v', name: 'Vito (W447)', class: 'Vito', years: generateYears(2014, 2026) },
  { id: 'evito', name: 'eVito', class: 'Vito', years: generateYears(2018, 2026) },

  // Citan
  { id: 'w415', name: 'Citan (W415)', class: 'Citan', years: generateYears(2012, 2021) },
  { id: 'w420', name: 'Citan (W420)', class: 'Citan', years: generateYears(2021, 2026) },
  { id: 'ecitan', name: 'eCitan', class: 'Citan', years: generateYears(2022, 2026) },

  // T-Class
  { id: 'w420t', name: 'T-Class (W420)', class: 'T-Class', years: generateYears(2022, 2026) },
  { id: 'et420', name: 'EQT', class: 'T-Class', years: generateYears(2022, 2026) },

  // X-Class
  { id: 'w470', name: 'X-Class (W470)', class: 'X-Class', years: generateYears(2017, 2020) },
];

// Helper function to get models by class
export function getModelsByClass(className: string): MercedesModel[] {
  return MERCEDES_MODELS.filter(model => model.class === className);
}

// Helper function to get all models for a specific year
export function getModelsForYear(year: number): MercedesModel[] {
  return MERCEDES_MODELS.filter(model => model.years.includes(year));
}

// Helper function to search models
export function searchModels(query: string): MercedesModel[] {
  const lowerQuery = query.toLowerCase();
  return MERCEDES_MODELS.filter(
    model =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.class.toLowerCase().includes(lowerQuery) ||
      model.id.toLowerCase().includes(lowerQuery)
  );
}
