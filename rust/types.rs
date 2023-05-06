#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;
use serde::Deserialize;
#[cfg(any(feature = "wasm", feature = "voters_sample"))]
use serde::Serialize;

#[cfg_attr(
    any(feature = "wasm", feature = "voters_sample"),
    derive(Serialize, Copy, Clone)
)]
#[derive(Debug, Deserialize)]
pub struct XY {
    pub x: f32,
    pub y: f32,
}

#[cfg_attr(feature = "wasm", derive(Serialize))]
#[derive(Debug, Deserialize)]
pub struct Party {
    pub x: f32,
    pub y: f32,
    pub coalition: Option<usize>,
}

/// The result of an allocation
pub type AllocationResult = Vec<usize>;

/// The result of a single simulation
#[cfg_attr(feature = "wasm", derive(Serialize, Deserialize))]
pub struct SimulationResult {
    /// The x coordinate of the voter mean
    pub x: f32,
    /// The y coordinate of the voter mean
    pub y: f32,
    /// The number of seats won by each party
    pub seats_by_party: AllocationResult,
    #[cfg(feature = "voters_sample")]
    /// A random sample of voters used for this result
    pub voters_sample: Option<Vec<XY>>,
}

pub struct SimulateElectionsArgs<'a> {
    pub n_seats: usize,
    pub n_voters: usize,
    pub stdev: f32,
    pub parties: &'a [Party],
    pub seed: Option<u64>,
    #[cfg(feature = "progress_bar")]
    pub bar: &'a ProgressBar,
    #[cfg(feature = "voters_sample")]
    pub use_voters_sample: bool,
    /// party_of_cands is a lookup table where the index is the cand_idx,
    /// and the value is the party_idx
    pub party_of_cands: Option<Vec<usize>>,
    pub n_parties: Option<usize>,
}
