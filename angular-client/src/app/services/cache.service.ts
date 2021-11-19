import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * A wrapper for a cache item
 */
interface CacheItem {
  key: string;
  value: Observable<any>;
  cacheUntil: number;
}

/**
 * A simple cache mainly for API responses. It will cache the returned Observable
 * and keeps it in the cache for a given amount of time.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, CacheItem> = new Map<string, CacheItem>();

  constructor() {}

  /**
   * Adds the given Observable to the cache. The cacheTime is for how
   * long the item should be cached (in ms). Any existing entry will be
   * overridden.
   */
  public add(key: string, value: Observable<any>, cacheTime: number): void {
    this.cache.set(key, {
      key,
      value,
      cacheUntil: new Date().getTime() + cacheTime
    });
  }

  /**
   * Returns true if there is an item in the cache for the given key. Will
   * check the cache time first and invalidate an entry if necessary.
   */
  public hasKey(key: string): boolean {
    if (this.cache.has(key)) {
      this.invalidate(this.cache.get(key));
      return this.cache.has(key);
    }
    return false;
  }

  /**
   * Returns the cached Observable. Make sure to call: hasKey first. This is
   * to avoid returning null.
   */
  public get(key: string): Observable<any> {
    return this.cache.get(key).value;
  }

  /**
   * Removes all cached items which contain the given keyPart.
   */
  public removeAll(keyPart: string): void {
    this.cache.forEach((value, key) => {
      if (key.includes(keyPart)) {
        this.remove(key);
      }
    });
  }

  /**
   * Removes a cached item from the cache
   */
  public remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Deletes all cached entries
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Checks whether the given CachedItem is still within the given time limit,
   * will delete otherwise.
   */
  private invalidate(item: CacheItem): void {
    const now = new Date();
    if (item.cacheUntil < now.getTime()) {
      this.cache.delete(item.key);
    }
  }
}
