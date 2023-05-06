pub mod allocate;
pub mod generate;
mod lib;
pub mod phragmen;
pub mod reweighter;
pub mod sss;
pub mod star_pr;
pub mod strategy;
pub mod thiele;

// Directly expose the export instead of going through an extraenous
// mod path that has no meaningful name (lib)
pub use lib::Cardinal;

#[cfg(test)]
mod tests;
