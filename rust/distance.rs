#[cfg(feature = "intrinsics")]
use std::intrinsics::{fadd_fast, fmul_fast, fsub_fast};

use crate::XY;

#[inline(always)]
fn distance_simple(party: &XY, voter: &XY) -> f32 {
    let a = (party.x - voter.x).powi(2);
    let b = (party.y - voter.y).powi(2);
    a + b
}

// TODO: this is dot product of the two differences (both without squaring)
// wasm and arch CPUs has a dedicated SIMD instruction for dot product
#[cfg(any(feature = "fma_non_stv", feature = "fma_stv"))]
#[inline(always)]
fn distance_fma(party: &XY, voter: &XY) -> f32 {
    let a = party.x - voter.x;
    let b = (party.y - voter.y).powi(2);
    a.mul_add(a, b)
}

#[cfg(feature = "intrinsics")]
#[inline(always)]
fn distance_intrinsics(party: &XY, voter: &XY) -> f32 {
    unsafe {
        let a = fsub_fast(party.x, voter.x);
        let a_square = fmul_fast(a, a);
        let b = fsub_fast(party.y, voter.y);
        let b_square = fmul_fast(b, b);
        // we don't actually want the distances, but to find the smallest one.
        // both a and b are positive because they are squared,
        // so we can skip the sqrt, as sqrt is monotonic for positive numbers:
        // the order of values do not change after sqrt so we can
        // find the smallest distance squared instead of smallest distance
        fadd_fast(a_square, b_square)
    }
}

#[cfg(feature = "intrinsics")]
#[inline(always)]
pub fn distance_non_stv(party: &XY, voter: &XY) -> f32 {
    distance_intrinsics(party, voter)
}

#[cfg(all(not(feature = "intrinsics"), feature = "fma_non_stv"))]
#[inline(always)]
pub fn distance_non_stv(party: &XY, voter: &XY) -> f32 {
    distance_fma(party, voter)
}

#[cfg(all(not(feature = "intrinsics"), not(feature = "fma_non_stv")))]
#[inline(always)]
pub fn distance_non_stv(party: &XY, voter: &XY) -> f32 {
    distance_simple(party, voter)
}

#[cfg(feature = "intrinsics")]
#[inline(always)]
pub fn distance_stv(party: &XY, voter: &XY) -> f32 {
    distance_intrinsics(party, voter)
}

#[cfg(all(not(feature = "intrinsics"), feature = "fma_stv"))]
#[inline(always)]
pub fn distance_stv(party: &XY, voter: &XY) -> f32 {
    distance_fma(party, voter)
}

#[cfg(all(not(feature = "intrinsics"), not(feature = "fma_stv")))]
#[inline(always)]
pub fn distance_stv(party: &XY, voter: &XY) -> f32 {
    distance_simple(party, voter)
}

