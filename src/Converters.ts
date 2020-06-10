import { JsonConverter, JsonCustomConvert } from 'json2typescript';

// could be 'default', 'en-US', etc.
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('default', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'UTC',
  hour12: false,
});

export function dateToISO8601(date: Date) {
  const { year, month, day, hour, minute, second } = DATE_TIME_FORMAT.formatToParts(date).reduce<
    Record<string, string>
  >((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${year}-${month}-${day}T${hour === '24' ? '00' : hour}:${minute}:${second}+0000`;
}

/* eslint-disable class-methods-use-this */
@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    return dateToISO8601(date);
  }

  deserialize(date: any): Date {
    return new Date(date);
  }
}
/* eslint-enable class-methods-use-this */
