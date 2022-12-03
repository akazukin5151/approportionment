use plotters::style::RGBAColor;

use crate::*;

pub trait ColorScheme {
    fn colorize_results_fn(
        &self,
    ) -> fn(
        results: AllocationResult,
        total_seats: u32,
        party_to_colorize: Option<&Party>,
    ) -> RGBAColor;
}
