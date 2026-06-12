import {
  collect,
  lazy,
  Collection,
  LazyCollection,
  createHigherOrderProxy,
  HIGHER_ORDER_TARGETS
} from '../src'

/**
 * The property form of higher-order messages is runtime-only (the TS
 * signatures keep the plain callable type), so tests reach it through a cast.
 */
function msg<R>(target: unknown, key: string): R {
  return (target as Record<string, R>)[key]
}

interface User {
  name: string
  role: string
  age: number
  active: boolean
  notify(greeting?: string): void
}

function makeUsers(): { log: string[]; users: Collection<User> } {
  const log: string[] = []
  const mk = (name: string, role: string, age: number, active: boolean): User => ({
    name,
    role,
    age,
    active,
    notify(greeting = 'hi') {
      log.push(`${greeting}:${this.name}`)
    }
  })
  return {
    log,
    users: collect([
      mk('Alice', 'admin', 30, true),
      mk('Bob', 'user', 25, false),
      mk('Cara', 'admin', 35, true)
    ])
  }
}

describe('higher-order messages (regression: 25 targets advertised, only 5 wired)', () => {
  it('all HIGHER_ORDER_TARGETS are callable properties on Collection and LazyCollection', () => {
    const c = collect([1, 2, 3]) as unknown as Record<string, unknown>
    const l = lazy([1, 2, 3]) as unknown as Record<string, unknown>
    for (const target of HIGHER_ORDER_TARGETS) {
      expect(typeof c[target], `Collection.${target}`).toBe('function')
      expect(typeof l[target], `LazyCollection.${target}`).toBe('function')
    }
  })

  describe('each family — deferred method invocation (README example)', () => {
    it('users.where(role, admin).each.notify() invokes the method on every item', () => {
      const { log, users } = makeUsers()
      const admins = users.where('role', 'admin')
      msg<() => Collection<User>>(admins.each, 'notify')()
      expect(log).toEqual(['hi:Alice', 'hi:Cara'])
    })

    it('each.notify(args) forwards arguments to each item method', () => {
      const { log, users } = makeUsers()
      msg<(greeting: string) => Collection<User>>(users.each, 'notify')('yo')
      expect(log).toEqual(['yo:Alice', 'yo:Bob', 'yo:Cara'])
    })

    it('each returns the collection so the chain continues', () => {
      const { users } = makeUsers()
      const result = msg<() => Collection<User>>(users.each, 'notify')()
      expect(result).toBe(users)
    })

    it('non-function members are accessed and discarded without throwing', () => {
      const { users } = makeUsers()
      expect(() => msg<() => unknown>(users.each, 'name')()).not.toThrow()
    })

    it('the plain call form is untouched', () => {
      const seen: number[] = []
      collect([1, 2, 3]).each((n) => {
        seen.push(n)
      })
      expect(seen).toEqual([1, 2, 3])
    })
  })

  describe('map/flatMap family — eager pluck on property access', () => {
    it('users.map.name plucks name (regression: used to return the method name "map")', () => {
      const { users } = makeUsers()
      const names = msg<Collection<string>>(users.map, 'name')
      expect(names).toBeInstanceOf(Collection)
      expect(names.all()).toEqual(['Alice', 'Bob', 'Cara'])
    })

    it('supports dotted paths through dataGet', () => {
      const items = collect([{ profile: { city: 'Oslo' } }, { profile: { city: 'Kathmandu' } }])
      expect(msg<Collection<string>>(items.map, 'profile.city').all()).toEqual([
        'Oslo',
        'Kathmandu'
      ])
    })

    it('flatMap.tags flattens plucked arrays', () => {
      const posts = collect([{ tags: ['a', 'b'] }, { tags: ['c'] }])
      expect(msg<Collection<string>>(posts.flatMap, 'tags').all()).toEqual(['a', 'b', 'c'])
    })

    it('the plain call form is untouched', () => {
      expect(
        collect([1, 2, 3])
          .map((n) => n * 2)
          .all()
      ).toEqual([2, 4, 6])
    })
  })

  describe('filter/reject/partition family', () => {
    it('filter.active keeps truthy, reject.active drops truthy', () => {
      const { users } = makeUsers()
      expect(msg<Collection<User>>(users.filter, 'active').count()).toBe(2)
      expect(msg<Collection<User>>(users.reject, 'active').count()).toBe(1)
    })

    it('partition.active splits into [truthy, falsy]', () => {
      const { users } = makeUsers()
      const [active, inactive] = msg<[Collection<User>, Collection<User>]>(
        users.partition,
        'active'
      )
      expect(active.count()).toBe(2)
      expect(inactive.count()).toBe(1)
    })
  })

  describe('boolean/value family — contains/doesntContain/every/some/first', () => {
    it('returns plain booleans and items usable directly', () => {
      const { users } = makeUsers()
      expect(msg<boolean>(users.contains, 'active')).toBe(true)
      expect(msg<boolean>(users.doesntContain, 'active')).toBe(false)
      expect(msg<boolean>(users.every, 'active')).toBe(false)
      expect(msg<boolean>(users.some, 'active')).toBe(true)
      expect(msg<User | undefined>(users.first, 'active')?.name).toBe('Alice')
    })
  })

  describe('sortBy/unique/groupBy/keyBy family', () => {
    it('sortBy.age and sortByDesc.age order by the plucked key', () => {
      const { users } = makeUsers()
      expect(msg<Collection<User>>(users.sortBy, 'age').first()?.age).toBe(25)
      expect(msg<Collection<User>>(users.sortByDesc, 'age').first()?.age).toBe(35)
    })

    it('unique.n deduplicates by the plucked key', () => {
      const items = collect([{ n: 1 }, { n: 1 }, { n: 2 }])
      expect(msg<Collection<{ n: number }>>(items.unique, 'n').count()).toBe(2)
    })

    it('groupBy.role groups with chainable Collection values', () => {
      const { users } = makeUsers()
      const groups = msg<Record<string, Collection<User>>>(users.groupBy, 'role')
      expect(groups['admin'].count()).toBe(2)
      expect(groups['user'].count()).toBe(1)
    })

    it('keyBy.name keys the record by the plucked value', () => {
      const { users } = makeUsers()
      const keyed = msg<Record<string, User>>(users.keyBy, 'name')
      expect(keyed['Bob'].age).toBe(25)
    })
  })

  describe('take/skip family', () => {
    it('takeWhile/skipWhile/takeUntil/skipUntil treat the plucked key as predicate', () => {
      const runs = collect([
        { v: 1, on: true },
        { v: 2, on: true },
        { v: 3, on: false },
        { v: 4, on: true }
      ])
      expect(msg<Collection<{ v: number }>>(runs.takeWhile, 'on').count()).toBe(2)
      expect(msg<Collection<{ v: number }>>(runs.skipWhile, 'on').count()).toBe(2)
      const stops = collect([
        { v: 1, stop: false },
        { v: 2, stop: true },
        { v: 3, stop: false }
      ])
      expect(msg<Collection<{ v: number }>>(stops.takeUntil, 'stop').count()).toBe(1)
      expect(msg<Collection<{ v: number }>>(stops.skipUntil, 'stop').count()).toBe(2)
    })
  })

  describe('aggregation family — property access returns the value', () => {
    it('sum/avg/average/max/min property form on Collection', () => {
      const { users } = makeUsers()
      expect(msg<number>(users.sum, 'age')).toBe(90)
      expect(msg<number>(users.avg, 'age')).toBe(30)
      expect(msg<number>(users.average, 'age')).toBe(30)
      expect(msg<number>(users.max, 'age')).toBe(35)
      expect(msg<number>(users.min, 'age')).toBe(25)
    })

    it('createHigherOrderProxy works for the getter-backed aggregation targets (regression: threw TypeError)', () => {
      const items = collect([{ price: 10 }, { price: 20 }])
      for (const target of ['sum', 'avg', 'average', 'max', 'min'] as const) {
        const proxy = createHigherOrderProxy<(by?: string) => number>(items, target)
        expect(() => proxy('price')).not.toThrow()
        expect(typeof msg<number>(proxy, 'price')).toBe('number')
      }
      expect(createHigherOrderProxy<(by?: string) => number>(items, 'sum')('price')).toBe(30)
    })

    it('createHigherOrderProxy still rejects unknown methods', () => {
      expect(() =>
        createHigherOrderProxy({}, 'sum' as (typeof HIGHER_ORDER_TARGETS)[number])
      ).toThrow(TypeError)
    })
  })

  describe('LazyCollection mirrors the same wiring (regression: zero proxies on lazy)', () => {
    it('aggregation property form works on LazyCollection', () => {
      const l = lazy([
        { votes: 1, age: 20 },
        { votes: 2, age: 40 }
      ])
      expect(msg<number>(l.sum, 'votes')).toBe(3)
      expect(msg<number>(l.avg, 'age')).toBe(30)
      expect(msg<number>(l.max, 'age')).toBe(40)
      expect(msg<number>(l.min, 'age')).toBe(20)
    })

    it('lazy map.name stays lazy: nothing is pulled until consumed', () => {
      let pulls = 0
      const l = lazy(function* (): Generator<{ name: string }> {
        for (const name of ['a', 'b', 'c']) {
          pulls++
          yield { name }
        }
      })
      const names = msg<LazyCollection<string>>(l.map, 'name')
      expect(pulls).toBe(0)
      expect(names.all()).toEqual(['a', 'b', 'c'])
      expect(pulls).toBe(3)
    })

    it('lazy each.notify() invokes the method per item', () => {
      const log: string[] = []
      const l = lazy([
        {
          name: 'x',
          notify() {
            log.push('x')
          }
        },
        {
          name: 'y',
          notify() {
            log.push('y')
          }
        }
      ])
      msg<() => unknown>(l.each, 'notify')()
      expect(log).toEqual(['x', 'y'])
    })

    it('lazy call forms are untouched', () => {
      expect(
        lazy([1, 2, 3, 4])
          .filter((n) => n % 2 === 0)
          .map((n) => n * 10)
          .all()
      ).toEqual([20, 40])
      expect(lazy([{ p: 2 }, { p: 3 }]).sum('p')).toBe(5)
    })
  })

  describe('proxy edge branches (audit: null-item guard and symbol passthrough uncovered)', () => {
    it('null items resolve members as undefined instead of throwing', () => {
      const c = collect<{ name: string } | null>([null, { name: 'a' }])
      expect(msg<Collection<unknown>>(c.map, 'name').all()).toEqual([undefined, 'a'])
    })

    it('symbol properties pass through to the underlying function', () => {
      const mapProxy = collect([1]).map as unknown as Record<symbol, unknown>
      expect(mapProxy[Symbol.iterator]).toBeUndefined()
      expect(mapProxy[Symbol.hasInstance]).toBeDefined() // inherited from Function
    })
  })
})
