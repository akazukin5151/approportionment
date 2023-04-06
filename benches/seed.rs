use std::env;

use chrono::Utc;
use libapproportionment::rng::Fastrand;
use rand::RngCore;

/// Get a seed for benchmarks.
/// It is either fixed by the SEED env var, or semi-fixed by the current
/// date (excluding time).
///
/// Using a seed based on the date means benchmark runs are deterministic
/// and can be directly compared. But we don't want to set a permanent
/// fixed seed for all future runs, so we allow the seed to change daily.
/// This means benchmark runs across different days (across midnight!)
/// are not comparable; set a SEED or wait.
///
/// When you do need to use a different seed (for example, to repeat
/// the benchmark with a different seed without waiting for tomorrow),
/// you can set the SEED env var.
pub fn get_xy_seeds() -> (Option<u64>, Option<u64>) {
    let evar = env::var("SEED")
        .map_err(|_| "failed to get var")
        .and_then(|val| val.parse::<u64>().map_err(|_| "failed to parse"));
    let election_seed = match evar {
        Ok(v) => v,
        // we can unwrap as our hms values are always valid
        Err(_) => Utc::now()
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .timestamp_nanos() as u64,
    };
    let mut rng = Fastrand::new(Some(election_seed));
    (Some(rng.next_u64()), Some(rng.next_u64()))
}
