pub mod allocate;
pub mod generate;
mod lib;

pub mod strategy;

// Directly expose the export instead of going through an extraenous
// mod path that has no meaningful name (lib)
pub use lib::Cardinal;

#[cfg(test)]
mod tests;
