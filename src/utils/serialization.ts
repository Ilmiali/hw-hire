export const serializeDate = (date: any): string | null => {
  if (!date) return null;
  
  // Handle Firestore Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return date.toDate().toISOString();
  }
  
  // Handle Date object
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  // Handle string (assume ISO or parsable)
  if (typeof date === 'string') {
    return date;
  }
  
  // Handle number (timestamp)
  if (typeof date === 'number') {
    return new Date(date).toISOString();
  }

  return null;
};

/**
 * recursively converting all Date/Timestamp objects to ISO strings.
 */
export const ensureSerializable = <T>(data: T): T => {
  if (Array.isArray(data)) {
    return data.map(item => ensureSerializable(item)) as unknown as T;
  }
  
  if (data !== null && typeof data === 'object') {
    // Check if it's a Firestore Timestamp-like object (has toDate)
    if ('toDate' in data && typeof (data as any).toDate === 'function') {
      return (data as any).toDate().toISOString() as unknown as T;
    }

    // Check if it's a native Date object
    if (data instanceof Date) {
      return data.toISOString() as unknown as T;
    }

    // Recursively process object keys
    return Object.entries(data).reduce((acc: any, [key, value]) => {
      acc[key] = ensureSerializable(value);
      return acc;
    }, {} as T);
  }
  
  return data;
};
