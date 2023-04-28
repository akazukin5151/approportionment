/// unit tests for STV regardless of party discipline
mod common_unit;

mod bitarray;

/// test for previous incidents of crashing; doesn't check for result
/// as they are not deterministic, so works for party discipline as well
mod no_crash;

/// property based regression tests by comparing with previous commit;
/// party discipline necessarily gives different results so not ran for it
mod regression;

/// compare to real world election results
#[cfg(feature = "test_real_stv")]
mod real;

mod party_discipline;
