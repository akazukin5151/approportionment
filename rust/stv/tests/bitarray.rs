use crate::stv::bitarray::{is_nth_elem_set, set_nth_elem};
use proptest::prelude::*;

#[test]
fn bitarray_is_set() {
    let ba = 0b010110;
    assert!(!is_nth_elem_set(ba, 0));
    assert!(is_nth_elem_set(ba, 1));
    assert!(is_nth_elem_set(ba, 2));
    assert!(!is_nth_elem_set(ba, 3));
    assert!(is_nth_elem_set(ba, 4));
    assert!(!is_nth_elem_set(ba, 5));
}

proptest! {
    #[test]
    fn bitarray_set_get_sole(nth in 0..32_usize) {
        let mut ba = 0b0;
        assert!(!is_nth_elem_set(ba, nth));
        ba = set_nth_elem(ba, nth);
        assert!(is_nth_elem_set(ba, nth));
    }

    #[test]
    fn bitarray_set_get(ba in 0..usize::MAX, nth in 0..32_usize) {
        let ba = set_nth_elem(ba, nth);
        assert!(is_nth_elem_set(ba, nth));
    }

    #[test]
    fn empty_and_out_of_bounds_bitarray(nth in 0..32_usize) {
        assert!(!is_nth_elem_set(0b0, nth))
    }
}
