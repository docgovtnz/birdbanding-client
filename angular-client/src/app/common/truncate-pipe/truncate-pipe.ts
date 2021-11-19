import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, args: any[]): string {
    if (value === null || value === undefined) {
      return '';
    }
    const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
    const suffix = args.length > 1 ? args[1] : '...';
    return value.length > limit ? value.substring(0, limit) + suffix : value;
  }
}
