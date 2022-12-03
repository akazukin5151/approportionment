use crate::*;
use plotters::prelude::*;

impl ColorScheme for config::Color {
    fn colorize_results_fn(
        &self,
    ) -> fn(
        results: AllocationResult,
        total_seats: u32,
        party_to_colorize: Option<&Party>,
    ) -> RGBAColor {
        match self {
            config::Color::Continuous => party_seats_to_continuous_color,
            config::Color::Discrete => party_seats_to_discrete_color,
            config::Color::Average => average_party_colors,
        }
    }
}

fn party_seats_to_continuous_color(
    results: AllocationResult,
    total_seats: u32,
    party_to_colorize: Option<&Party>,
) -> RGBAColor {
    let party = party_to_colorize.as_ref().unwrap();
    let prop = *results.get(party).unwrap_or(&0) as f64 / total_seats as f64;
    party.color.mix(prop)
}

fn party_seats_to_discrete_color(
    results: AllocationResult,
    _total_seats: u32,
    party_to_colorize: Option<&Party>,
) -> RGBAColor {
    let party = party_to_colorize.as_ref().unwrap();
    let seats = *results.get(party).unwrap_or(&0);
    Palette99::pick(seats as usize).to_rgba()
}

fn average_party_colors(
    results: AllocationResult,
    total_seats: u32,
    _party_to_colorize: Option<&Party>,
) -> RGBAColor {
    let mut colors = vec![];
    for (party, seats) in results {
        let color = party.color;
        let prop = seats as f32 / total_seats as f32;
        let r = color.0 as f32 * prop;
        let g = color.1 as f32 * prop;
        let b = color.2 as f32 * prop;
        colors.push((r, g, b));
    }
    let (r, g, b) = colors
        .iter()
        .cloned()
        .reduce(|acc: (f32, f32, f32), item: (f32, f32, f32)| {
            (
                acc.0 + item.0.powi(2),
                acc.1 + item.1.powi(2),
                acc.2 + item.2.powi(2),
            )
        })
        .unwrap();

    // *2 to make it brighter
    RGBAColor(
        ((r / 3.).powf(0.5) * 2.) as u8,
        ((g / 3.).powf(0.5) * 2.) as u8,
        ((b / 3.).powf(0.5) * 2.) as u8,
        1.,
    )
}
