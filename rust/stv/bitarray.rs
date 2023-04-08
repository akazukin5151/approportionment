/// Handy functions to interact with bitarrays.
///
/// Bitarrays are used to replace vector of booleans.
///
/// This is a micro-optimization and not that impactful, but better than nothing;
/// we are past the point of premature optimization, and we are actually at
/// the point where we want to squeeze out every millisecond.
/// Benchmarks shows that bitarrays are slightly faster.
///
/// There are various reasons to use bitarrays:
/// - Vectors have dynamic length, so it is not possible to make them static slices.
/// - Vectors are stored on the heap, but bitarrays are stored on the stack
/// - Bitarrays uses less memory; booleans are 8 bits but those 8 bits can encode 8
///   booleans already
/// - Bit fiddling is fast, random memory access is slow
///
/// The limitations of bitarrays are:
/// - The current implementation uses a single `usize`, so it can only handle up to
///   32 candidates for 32-bit machines, or 64 candidates for 64-bit machines
/// - Increased assembly size [0]
///
/// However many limitations [0] points out doesn't apply. The code is inlined so
/// there's no debuggability anyway; just print out the bitarray. Rust is thread-safe
/// so there's no multithreading concerns. The `eliminated` bitarray is needed
/// for every election; that's 40000 times for a 200x200 grid. The `pending` bitarray
/// is needed multiple times every election. Surely that's enough times to make it
/// worth it.
///
/// [0] https://web.archive.org/web/20130127111322/http://blogs.msdn.com/b/oldnewthing/archive/2008/11/26/9143050.aspx

// inline(always) is needed; according to cargo asm they aren't inlined otherwise

/// check if the nth bit in the bitarray is equal to 1
#[inline(always)]
pub fn is_nth_elem_set(ba: usize, nth: usize) -> bool {
    // use bitwise-and to isolate the nth bit
    // if the nth bit is set, it will have a value of n^2
    // if it is not set, it will always be 0, so check for 0
    (ba & (0b1 << nth)) != 0
}

/// set the nth bit in the bitarray to 1; does nothing if it is already 1
#[inline(always)]
pub fn set_nth_elem(ba: usize, nth: usize) -> usize {
    ba | (0b1 << nth)
}
