/**
 * timeago.js - Time Ago Formatter
 * 
 * Konvertiert Timestamp zu "vor X Zeit" Format (Deutsch)
 */

export function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? 'vor 1 Jahr' : `vor ${years} Jahren`;
  }
  if (months > 0) {
    return months === 1 ? 'vor 1 Monat' : `vor ${months} Monaten`;
  }
  if (days > 0) {
    return days === 1 ? 'vor 1 Tag' : `vor ${days} Tagen`;
  }
  if (hours > 0) {
    return hours === 1 ? 'vor 1 Stunde' : `vor ${hours} Stunden`;
  }
  if (minutes > 0) {
    return minutes === 1 ? 'vor 1 Minute' : `vor ${minutes} Minuten`;
  }
  return 'gerade eben';
}
