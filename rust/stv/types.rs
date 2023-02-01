/// Vector of candidate idxes in order of first to last preference
// Clone is needed for the new function to duplicate empty ballots
// at the start
#[derive(Clone, Debug)]
pub struct StvBallot(pub Vec<usize>);
