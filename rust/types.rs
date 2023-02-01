use serde::Deserialize;
#[cfg(feature = "wasm")]
use serde::Serialize;

#[cfg_attr(feature = "wasm", derive(Serialize))]
#[derive(Debug, Copy, Clone, Deserialize)]
pub struct XY {
    pub x: f32,
    pub y: f32,
}

#[cfg(test)]
impl XY {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }
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
