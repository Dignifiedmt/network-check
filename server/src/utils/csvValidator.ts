import { db } from '../db/db.ts';

export interface CsvValidationRow {
  rowNumber: number;
  raw: Record<string, string>;
  isValid: boolean;
  errors: string[];
  parsed?: {
    state_id: number;
    lga_id: number;
    operator_id: number;
    voice_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
    data_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
    sms_rating: 'Good' | 'Fair' | 'Poor' | 'No Service';
    source_name: string;
    source_type: 'Official' | 'Community' | 'Demo';
    source_url: string;
    dataset_version: string;
    last_updated: string;
    notes?: string;
  };
}

export interface CsvValidationResult {
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  rows: CsvValidationRow[];
  canImport: boolean;
}

const VALID_RATINGS = ['Good', 'Fair', 'Poor', 'No Service'];
const VALID_SOURCE_TYPES = ['Official', 'Community', 'Demo'];

export async function validateBaselineCsv(csvContent: string): Promise<CsvValidationResult> {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      totalRows: 0,
      validRowsCount: 0,
      errorRowsCount: 0,
      rows: [],
      canImport: false,
    };
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\"']/g, ''));
  const requiredHeaders = [
    'state',
    'lga',
    'operator',
    'voice_rating',
    'data_rating',
    'sms_rating',
    'source_name',
    'source_type',
    'source_url',
    'dataset_version',
    'last_updated',
  ];

  const states = await db.getStates();
  const allLgas = await db.getLgas();
  const operators = await db.getOperators();

  const validatedRows: CsvValidationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const rawValues = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const rawMap: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawMap[h] = rawValues[idx] || '';
    });

    const errors: string[] = [];

    // State check
    const stateName = rawMap['state'] || '';
    const stateMatch = states.find(
      s => s.name.toLowerCase() === stateName.toLowerCase() || s.code.toLowerCase() === stateName.toLowerCase()
    );
    if (!stateMatch) {
      errors.push(`Unknown state: "${stateName}". Supported states: ${states.map(s => s.name).join(', ')}`);
    }

    // LGA check
    const lgaName = rawMap['lga'] || '';
    const lgaMatch = stateMatch
      ? allLgas.find(l => l.state_id === stateMatch.id && l.name.toLowerCase() === lgaName.toLowerCase())
      : undefined;
    if (!lgaMatch) {
      errors.push(`Unknown LGA: "${lgaName}" in state "${stateName}".`);
    }

    // Operator check
    const opName = rawMap['operator'] || '';
    const opMatch = operators.find(
      o => o.name.toLowerCase().includes(opName.toLowerCase()) || o.code.toLowerCase() === opName.toLowerCase()
    );
    if (!opMatch) {
      errors.push(`Unknown operator: "${opName}". Supported: ${operators.map(o => o.code).join(', ')}`);
    }

    // Ratings check
    const voice = rawMap['voice_rating'] || '';
    const data = rawMap['data_rating'] || '';
    const sms = rawMap['sms_rating'] || '';

    const normalizeRating = (r: string) => {
      const match = VALID_RATINGS.find(vr => vr.toLowerCase() === r.toLowerCase());
      return match as 'Good' | 'Fair' | 'Poor' | 'No Service' | undefined;
    };

    const normVoice = normalizeRating(voice);
    const normData = normalizeRating(data);
    const normSms = normalizeRating(sms);

    if (!normVoice) errors.push(`Invalid voice_rating "${voice}". Must be: ${VALID_RATINGS.join(', ')}`);
    if (!normData) errors.push(`Invalid data_rating "${data}". Must be: ${VALID_RATINGS.join(', ')}`);
    if (!normSms) errors.push(`Invalid sms_rating "${sms}". Must be: ${VALID_RATINGS.join(', ')}`);

    // Source Type check
    const sourceTypeRaw = rawMap['source_type'] || 'Official';
    const normSourceType = VALID_SOURCE_TYPES.find(
      st => st.toLowerCase() === sourceTypeRaw.toLowerCase()
    ) as 'Official' | 'Community' | 'Demo' | undefined;
    if (!normSourceType) {
      errors.push(`Invalid source_type "${sourceTypeRaw}". Must be: ${VALID_SOURCE_TYPES.join(', ')}`);
    }

    // Date check (YYYY-MM-DD)
    const dateStr = rawMap['last_updated'] || new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || isNaN(Date.parse(dateStr))) {
      errors.push(`Invalid last_updated date format "${dateStr}". Expected YYYY-MM-DD.`);
    }

    const isValid = errors.length === 0;

    validatedRows.push({
      rowNumber: rowNum,
      raw: rawMap,
      isValid,
      errors,
      parsed: isValid && stateMatch && lgaMatch && opMatch && normVoice && normData && normSms && normSourceType
        ? {
            state_id: stateMatch.id,
            lga_id: lgaMatch.id,
            operator_id: opMatch.id,
            voice_rating: normVoice,
            data_rating: normData,
            sms_rating: normSms,
            source_name: rawMap['source_name'] || 'NCC Baseline Audit',
            source_type: normSourceType,
            source_url: rawMap['source_url'] || '',
            dataset_version: rawMap['dataset_version'] || 'NCC-2026-IMPORTED',
            last_updated: dateStr,
            notes: rawMap['notes'] || '',
          }
        : undefined,
    });
  }

  const validRowsCount = validatedRows.filter(r => r.isValid).length;
  const errorRowsCount = validatedRows.length - validRowsCount;

  return {
    totalRows: validatedRows.length,
    validRowsCount,
    errorRowsCount,
    rows: validatedRows,
    canImport: errorRowsCount === 0 && validRowsCount > 0,
  };
}
