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
#[derive(Debug, Deserialize, Clone, Copy)]
pub struct Party {
    pub x: f32,
    pub y: f32,
    #[cfg(feature = "stv_party_discipline")]
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

#[derive(Clone)]
pub struct SimulateElectionsArgs {
    pub n_seats: usize,
    pub n_voters: usize,
    pub stdev: f32,
    pub parties: Vec<Party>,
    pub seed: Option<u64>,
    #[cfg(feature = "progress_bar")]
    pub bar: &ProgressBar,
    #[cfg(feature = "voters_sample")]
    pub use_voters_sample: bool,
    #[cfg(feature = "stv_party_discipline")]
    pub party_of_cands: &[usize],
    #[cfg(feature = "stv_party_discipline")]
    pub n_parties: usize,
}
