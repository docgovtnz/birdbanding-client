import { getTestBed, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });
  });

  it('should be created', () => {
    const cache = TestBed.inject(CacheService);
    expect(cache).toBeTruthy();
  });

  it('should add a cache item', () => {
    const cache = TestBed.inject(CacheService);
    cache.add('item_1', of('Item_1'), 1000);
    expect(cache.hasKey('item_1')).toBeTruthy('Entry not found');
  });

  it('should return a cached item', () => {
    const cache = TestBed.inject(CacheService);
    const obs = of('Item_2');
    cache.add('item_2', obs, 1000);
    expect(cache.get('item_2')).toBe(obs, 'Not the expected cache item returned');
  });

  it('should not have an item after waiting longer than the timeout', done => {
    const cache = TestBed.inject(CacheService);
    cache.add('item_3', of('Item_3'), 10);
    setTimeout(() => {
      expect(cache.hasKey('item_3')).toBeFalsy('Cache item still exists');
      done();
    }, 100);
  });

  async function sleep() {
    await delay(1000);
  }
});
