# API Reference

The Collection class provides over 120 chainable methods for elegant array manipulation. 

::: tip
Almost all methods return a **new** Collection instance. This means the original collection is not mutated unless specifically designated. To extract the raw JavaScript array, call `.all()` or `.toArray()` at the end of your chain.
:::

## Creation

- **`collect(items)`**: The default helper for instantiating a Collection.
- **`make(items)`**: Instantiates a Collection (alias of collect).
- **`fromJson(json)`**: Creates a Collection recursively from a JSON string.
- **`times(number, callback)`**: Creates a Collection by invoking the callback a given amount of times.
- **`wrap(value)`**: Wraps the given value in a collection. If the value is already a collection, it is returned untouched.

## Extraction & Conversion

- **`all()`**: Returns the underlying native JavaScript array.
- **`toArray()`**: Returns the underlying array. If the collection contains objects with a `toArray()` method, it will call it.
- **`toJson()`**: Converts the Collection to a JSON string.
- **`toPrettyJson()`**: Converts the Collection into formatted, pretty-printed JSON.
- **`implode(glue, value?)`**: Joins the items in a collection.
- **`join(glue, finalGlue?)`**: Joins the items in a collection with an optional distinct string for the last item ("and").

## Filtering

- **`filter(callback)`**: Filters the collection using the given callback, keeping items that return true.
- **`reject(callback)`**: The inverse of filter. Keeps items that return false.
- **`where(key, operator?, value?)`**: Filters the collection by a given key / value / operator. 
  *Example:* `where('price', '>', 100)`
- **`whereStrict(key, value)`**: Filters using strict equality (`===`).
- **`whereBetween(key, [min, max])`**: Filters items where the predefined key is between two values.
- **`whereNotBetween(key, [min, max])`**: Filters items where the predefined key is *not* between two values.
- **`whereIn(key, values)`**: Filters down to items where the item's key value matches one in the provided array.
- **`whereNotIn(key, values)`**: The inverse of `whereIn`.
- **`whereNull(key)`**: Returns items where the given key is null or undefined.
- **`whereNotNull(key)`**: Returns items where the given key is not null or undefined.
- **`whereInstanceOf(type)`**: Filters the collection to only include objects that are instances of a given class.
- **`unique(key?)`**: Returns all of the unique items in the collection.
- **`uniqueStrict(key?)`**: Returns all of the unique items in the collection using strict equality.
- **`except(keys)`**: Returns all items in the collection except for those with the specified keys (for dictionaries).
- **`only(keys)`**: Returns only the items in the collection with the specified keys.
- **`first(callback?, default?)`**: Returns the first element in the collection that passes a given truth test.
- **`firstOrFail(callback?)`**: Returns the first element that passes, or throws an `ItemNotFoundException`.
- **`firstWhere(key, operator?, value?)`**: Returns the first element in the collection where the key matches the value.
- **`last(callback?, default?)`**: Returns the last element in the collection that passes a given truth test.
- **`sole(callback?)`**: Returns the only element in the collection that passes a test. If 0 or >1 elements pass, it throws an exception.

## Mapping & Transformation

- **`map(callback)`**: Iterates through the collection and passes each value to the given callback, replacing it with the callback's return value.
- **`mapInto(class)`**: Iterates through the collection, injecting each element into a new instance of the given class.
- **`mapSpread(callback)`**: Iterates through the collection, mapping passing chunked or nested arrays as spread arguments into the callback.
- **`mapToGroups(callback)`**: Groups the collection's items by a given callback and maps them to arrays.
- **`mapWithKeys(callback)`**: Iterates through the collection and passes each value to the given callback. The callback should return an associative array (or tuple) containing a single key/value pair.
- **`flatMap(callback)`**: Iterates through the collection and passes each value to the given callback. The result is then flattened by one level.
- **`flatten(depth?)`**: Flattens a multi-dimensional collection into a single dimension.
- **`collapse()`**: Collapses a collection of arrays into a single, flat collection.
- **`chunk(size)`**: Breaks the collection into multiple, smaller collections of a given size.
- **`chunkWhile(callback)`**: Breaks the collection into multiple, smaller collections while the given callback returns true.
- **`sliding(size, step?)`**: Returns a new collection of chunks representing a "sliding window" view of the items.
- **`split(numberOfGroups)`**: Splits a collection into the given number of groups.
- **`splitIn(numberOfGroups)`**: Splits the collection in exactly the number of groups defined, filling incomplete groups at the end.
- **`dot()`**: Flattens a multi-dimensional array/object to a single level array that uses "dot" notation to indicate depth.
- **`undot()`**: Expands a single-dimensional array that uses "dot" notation into a multi-dimensional array.
- **`flip()`**: Swaps the collection's keys with their corresponding values (for objects).
- **`pluck(value, key?)`**: Retrieves all of the values for a given key.
- **`values()`**: Returns a new collection with the keys reset to consecutive integers.
- **`keys()`**: Returns all of the collection's keys.
- **`zip(items)`**: Merges together the values of the given array with the values of the original collection at the corresponding index.
- **`combine(values)`**: Combines the keys of the collection with the values of another array.
- **`crossJoin(...arrays)`**: Cross joins the collection's values among the given arrays or collections, returning all possible permutations.

## Math & Aggregation

- **`sum(callback?)`**: Returns the sum of all items in the collection.
- **`average(callback?)` / `avg(callback?)`**: Returns the average value of a given key.
- **`min(callback?)`**: Returns the minimum value of a given key.
- **`max(callback?)`**: Returns the maximum value of a given key.
- **`median(key?)`**: Returns the median value of a given key.
- **`mode(key?)`**: Returns the mode value of a given key.
- **`count()`**: Returns the total number of items in the collection.
- **`countBy(callback?)`**: Counts the occurrences of values in the collection.
- **`percentage(callback)`**: Returns the percentage of items in the collection that pass a given truth test.

## Sorting

- **`sort(callback?)`**: Sorts the collection using standard Array.prototype.sort().
- **`sortBy(callback)`**: Sorts the collection by the given key.
- **`sortByDesc(callback)`**: Sorts the collection by the given key in descending order.
- **`sortDesc()`**: Sorts the collection in descending order.
- **`sortKeys(options?)`**: Sorts the collection by the keys of the underlying object.
- **`sortKeysDesc(options?)`**: Sorts the collection by the keys of the underlying object in descending order.
- **`sortKeysUsing(callback)`**: Sorts the object's keys using the given callback.

## Searching & Inspection

- **`contains(key, operator?, value?)`**: Determines whether the collection contains a given item.
- **`containsStrict(key, value)`**: Determines whether the collection contains a given item using strict equality.
- **`containsOneItem()`**: Determines if the collection contains exactly one item.
- **`doesntContain(key, operator?, value?)`**: The inverse of contains.
- **`search(value, strict?)`**: Searches the collection for the given value and returns its key if found.
- **`has(keys)`**: Determines if a given key exists in the collection.
- **`hasAny(keys)`**: Determines whether any of the given keys exist in the collection.
- **`every(callback)`**: Determines if all items pass the given truth test.
- **`some(callback)`**: Determines if any item passes the given truth test.
- **`isEmpty()`**: Returns true if the collection is empty.
- **`isNotEmpty()`**: Returns true if the collection is not empty.

## Iteration

- **`each(callback)`**: Iterates over the items in the collection and passes each item to a callback.
- **`eachSpread(callback)`**: Iterates over the collection's arrays, mapping each array element directly to the callback's arguments.
- **`tap(callback)`**: Passes the collection to the given callback, allowing you to "tap" into the collection at a specific point without mutating it.
- **`transform(callback)`**: Mutates the collection itself! Iterates over the collection and calls the given callback.
- **`pipe(callback)`**: Passes the collection to the given callback and returns the result.

## Partitioning & Access

- **`partition(callback)`**: Separates elements that pass a given truth test from those that do not.
- **`groupBy(callback)`**: Groups the collection's items by a given key.
- **`keyBy(callback)`**: Keys the collection by the given key. If multiple items have the same key, only the last one will appear in the new collection.
- **`take(limit)`**: Returns a new collection with the specified number of items.
- **`takeUntil(callback)`**: Takes items from the collection until the given callback returns true.
- **`takeWhile(callback)`**: Takes items from the collection while the given callback returns true.
- **`skip(count)`**: Skips the given number of items and returns a new collection with the rest.
- **`skipUntil(callback)`**: Skips items from the collection until the given callback returns true.
- **`skipWhile(callback)`**: Skips items from the collection while the given callback returns true.
- **`slice(offset, length?)`**: Returns a slice of the collection starting at the given index.
- **`forPage(page, perPage)`**: Returns a new collection containing the items that would be present on a given page number.
- **`nth(step, offset?)`**: Creates a new collection consisting of every n-th element.

## Addition & Removal

- **`push(value)`**: Appends an item to the end of the collection.
- **`prepend(value, key?)`**: Adds an item to the beginning of the collection.
- **`concat(items)`**: Appends the given array or collection to the end of the collection.
- **`merge(items)`**: Merges the given array or collection into the original collection.
- **`union(items)`**: Adds the given array to the collection. If the given array contains keys that are already in the original collection, the original collection's values will be preferred.
- **`diff(items)`**: Compares the collection against another collection or a plain array based on its values.
- **`diffAssoc(items)`**: Compares the collection against another collection or a plain array based on its keys and values.
- **`diffKeys(items)`**: Compares the collection against another collection or a plain array based on its keys.
- **`intersect(items)`**: Removes any values from the original collection that are not present in the given array or collection.
- **`intersectByKeys(items)`**: Removes any keys from the original collection that are not present in the given associative array or collection.
- **`pop(count?)`**: Removes and returns the last item from the collection.
- **`shift(count?)`**: Removes and returns the first item from the collection.
- **`pull(key, default?)`**: Removes and returns an item from the collection by its key.
- **`forget(keys)`**: Removes an item from the collection by its key. 
- **`splice(offset, length?, replacement?)`**: Removes and returns a slice of items starting at the specified index.

## Conditional Operations

- **`when(boolean, callback, default?)`**: Executes the given callback when the first argument given to the method evaluates to true.
- **`whenEmpty(callback, default?)`**: Executes the given callback when the collection is empty.
- **`whenNotEmpty(callback, default?)`**: Executes the given callback when the collection is not empty.
- **`unless(boolean, callback, default?)`**: Executes the given callback when the first argument given to the method evaluates to false.
- **`unlessEmpty(callback, default?)`**: Executes the given callback when the collection is not empty.
- **`unlessNotEmpty(callback, default?)`**: Executes the given callback when the collection is empty.

## Misc Diffs & Intersects

- **`diffAssocUsing`**
- **`intersectUsing`**
- **`intersectAssoc`**
- **`intersectAssocUsing`**
- **`duplicates` & `duplicatesStrict`**

## Debugging

- **`dump()`**: Dumps the collection's items.
- **`dd()`**: Dumps the collection's items and halts execution (throws).

*(For exact parameter types and full edge-case behavior, refer to the [Laravel Collection Documentation](https://laravel.com/docs/13.x/collections#available-methods) which this library meticulously mirrors).*
