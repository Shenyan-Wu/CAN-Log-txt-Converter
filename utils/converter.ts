import { CanFrame, ConversionOptions } from '../types';

/**
 * Parses a time string like "16:52:49.159.0" into total seconds.
 */
const parseTimestampToSeconds = (timeStr: string): number => {
  try {
    // Format: HH:mm:ss.ms.us (0-9)
    // Split by ':' first
    const parts = timeStr.trim().split(':');
    if (parts.length < 3) return 0;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    // The seconds part might be "49.159.0"
    const secondsPart = parts[2];
    
    // Replace the last dot with nothing if it's a weird format like .159.0 to make it standard float .1590
    // Or simpler: split by dot.
    const secParts = secondsPart.split('.');
    
    let seconds = parseInt(secParts[0], 10);
    let milliseconds = 0;
    let microseconds = 0;

    if (secParts.length > 1) {
       milliseconds = parseInt(secParts[1], 10);
    }
    if (secParts.length > 2) {
       microseconds = parseInt(secParts[2], 10);
    }

    return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000) + (microseconds / 1000000);
  } catch (e) {
    console.error("Error parsing timestamp", timeStr, e);
    return 0;
  }
};

/**
 * Main function to process the text content
 */
export const convertTextToAsc = (content: string, options: ConversionOptions): { result: string, frameCount: number, previewInput: string, previewOutput: string } => {
  const lines = content.split(/\r?\n/);
  const frames: CanFrame[] = [];
  let startTime = -1;

  // We capture the first few lines for preview
  const previewInputLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Always add to preview input until we have 5 lines, to show the user what we read
    if(previewInputLines.length < 5) previewInputLines.push(trimmed);

    // Skip known header lines
    if (trimmed.startsWith('序号') || trimmed.startsWith('Text:')) {
      continue;
    }

    const columns = trimmed.split(/\s+/);
    
    // Strict Check: First column must be the Sequence Number (integer)
    // This prevents parsing header lines that don't match strict string checks
    // or random text lines.
    const sequenceNum = parseInt(columns[0], 10);
    if (isNaN(sequenceNum)) {
      continue;
    }
    
    // Expected Columns based on input:
    // 0: Seq, 1: Dir, 2: Time, 3: ID, 4: Format, 5: Type, 6: Len, 7...: Data
    if (columns.length < 7) {
       continue; 
    }

    try {
      const dirStr = columns[1];
      const timeStr = columns[2];
      const idStr = columns[3];
      const frameFormatStr = columns[4]; // 数据帧 (Data) / 远程帧 (Remote)
      const frameTypeStr = columns[5];   // 标准帧 (Std) / 扩展帧 (Ext)
      const lenStr = columns[6];
      
      // Data bytes start from index 7
      const dataBytes = columns.slice(7);

      // Parse Timestamp
      const absoluteSeconds = parseTimestampToSeconds(timeStr);
      
      // Set start time from the very first valid frame found
      if (startTime === -1) {
        startTime = absoluteSeconds;
      }
      
      // Calculate relative timestamp (ASC must start at 0.000000 for immediate playback)
      let relTime = absoluteSeconds - startTime;
      
      // Handle potential midnight crossover (if log goes past 24:00:00)
      if (relTime < -43200) { // arbitrary threshold: 12 hours previous
         relTime += 24 * 3600;
      }

      // Parse Direction
      const direction = (dirStr === '接收') ? 'Rx' : 'Tx';

      // Parse ID
      let idHex = idStr.toLowerCase().replace('0x', '');
      
      const isExtended = frameTypeStr === '扩展帧';
      const type = frameFormatStr === '远程帧' ? 'r' : 'd';
      const dlc = parseInt(lenStr, 10);

      frames.push({
        timestamp: relTime,
        channel: 1, // Defaulting to channel 1
        id: idHex,
        isExtended,
        direction,
        type,
        dlc,
        data: dataBytes,
        rawTimestampStr: timeStr
      });

    } catch (e) {
      console.warn("Skipping malformed line:", line);
    }
  }

  // Generate ASC Content
  // We use the user provided date for the Day/Month/Year, but overwrite the time 
  // with the time from the first frame found in the file.
  const d = new Date(options.baseDate);
  
  if (startTime !== -1) {
    // startTime is total seconds from midnight (e.g., 16:52:49 = ~60769s)
    const totalSeconds = Math.floor(startTime);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    d.setHours(hours, minutes, seconds);
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const timeString = d.toTimeString().split(' ')[0]; // HH:MM:SS
  const ascDateHeader = `date ${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${timeString} ${d.getFullYear()}`;

  const header = [
    ascDateHeader,
    "base hex timestamps absolute",
    "internal events logged",
    "// version 11.0.0",
    ""
  ];

  const bodyLines = frames.map(f => {
    // Format: Timestamp Channel IDx Dir d/r DLC Data...
    // Example: 0.003700 1 c01d0e8x Rx d 8 13 50 c3 10 27 02 26 b0 
    
    const timeFixed = f.timestamp.toFixed(6);
    const idSuffix = f.isExtended ? 'x' : ''; 
    const dataStr = f.data.join(' ');
    
    return `${timeFixed} ${f.channel} ${f.id}${idSuffix} ${f.direction} ${f.type} ${f.dlc} ${dataStr}`;
  });

  const fullContent = [...header, ...bodyLines].join('\n');
  const previewOutput = [...header, ...bodyLines.slice(0, 5), ...(bodyLines.length > 5 ? ['...'] : [])].join('\n');

  return {
    result: fullContent,
    frameCount: frames.length,
    previewInput: previewInputLines.join('\n'),
    previewOutput
  };
};