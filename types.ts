export interface CanFrame {
  timestamp: number; // Seconds relative to start
  channel: number;
  id: string; // Hex string
  isExtended: boolean;
  direction: 'Rx' | 'Tx';
  type: 'd' | 'r'; // data or remote
  dlc: number;
  data: string[]; // Array of hex strings
  rawTimestampStr?: string; // For debugging
}

export interface ConversionResult {
  fileName: string;
  originalSize: number;
  convertedContent: string;
  frameCount: number;
  previewInput: string;
  previewOutput: string;
  error?: string;
}

export interface ConversionOptions {
  baseDate: Date;
}
